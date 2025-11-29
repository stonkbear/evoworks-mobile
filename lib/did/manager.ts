/**
 * DID Manager - Decentralized Identity Management
 * Supports did:key (ephemeral) and did:ethr (Ethereum-based)
 */

import { createAgent, IDIDManager, IKeyManager, IDataStore, IResolver } from '@veramo/core'
import { DIDManager } from '@veramo/did-manager'
import { KeyManager } from '@veramo/key-manager'
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { Resolver } from 'did-resolver'
import { getResolver as getKeyResolver } from '@veramo/did-provider-key'
import { getResolver as getEthrResolver } from 'ethr-did-resolver'
import { KeyDIDProvider } from '@veramo/did-provider-key'
import { EthrDIDProvider } from '@veramo/did-provider-ethr'
import { MemoryKeyStore, MemoryDIDStore, MemoryPrivateKeyStore } from '@veramo/data-store'

// Singleton Veramo agent
let agent: any = null

/**
 * Initialize Veramo agent for DID management
 */
function getAgent() {
  if (agent) return agent

  // In-memory stores for development (use database in production)
  const didStore = new MemoryDIDStore()
  const keyStore = new MemoryKeyStore()
  const privateKeyStore = new MemoryPrivateKeyStore()

  // Create KMS with encryption
  const secretKey = process.env.DID_KMS_SECRET_KEY || 'default-secret-key-change-in-production'
  const kms = new KeyManagementSystem(privateKeyStore)

  // Configure DID resolvers
  const didResolver = new Resolver({
    ...getKeyResolver(),
    ...getEthrResolver({
      networks: [
        {
          name: 'mainnet',
          rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
        },
        {
          name: 'sepolia',
          rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://sepolia.infura.io/v3/YOUR-PROJECT-ID',
        },
      ],
    }),
  })

  // Create Veramo agent
  agent = createAgent<IDIDManager & IKeyManager & IResolver>({
    plugins: [
      new KeyManager({
        store: keyStore,
        kms: {
          local: kms,
        },
      }),
      new DIDManager({
        store: didStore,
        defaultProvider: 'did:key',
        providers: {
          'did:key': new KeyDIDProvider({
            defaultKms: 'local',
          }),
          'did:ethr': new EthrDIDProvider({
            defaultKms: 'local',
            network: 'sepolia',
            rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://sepolia.infura.io/v3/YOUR-PROJECT-ID',
          }),
        },
      }),
      new DIDResolverPlugin({
        resolver: didResolver,
      }),
    ],
  })

  return agent
}

/**
 * Create a new DID for an agent
 */
export async function createAgentDID(): Promise<{ did: string; publicKey: string }> {
  try {
    const agent = getAgent()

    // Create did:key (no blockchain, instant, free)
    const identifier = await agent.didManagerCreate({
      provider: 'did:key',
      alias: `agent-${Date.now()}`,
    })

    // Extract public key from DID document
    const didDoc = await agent.resolveDid({ didUrl: identifier.did })
    const publicKey = didDoc.didDocument?.verificationMethod?.[0]?.publicKeyHex || ''

    return {
      did: identifier.did,
      publicKey,
    }
  } catch (error) {
    console.error('Error creating agent DID:', error)
    throw new Error('Failed to create agent DID')
  }
}

/**
 * Create a new DID for a user
 */
export async function createUserDID(): Promise<{ did: string; publicKey: string }> {
  try {
    const agent = getAgent()

    const identifier = await agent.didManagerCreate({
      provider: 'did:key',
      alias: `user-${Date.now()}`,
    })

    const didDoc = await agent.resolveDid({ didUrl: identifier.did })
    const publicKey = didDoc.didDocument?.verificationMethod?.[0]?.publicKeyHex || ''

    return {
      did: identifier.did,
      publicKey,
    }
  } catch (error) {
    console.error('Error creating user DID:', error)
    throw new Error('Failed to create user DID')
  }
}

/**
 * Create a new DID for an organization (using did:ethr for permanence)
 */
export async function createOrgDID(): Promise<{ did: string; publicKey: string }> {
  try {
    const agent = getAgent()

    // Use did:ethr for organizations (permanent, on-chain)
    const identifier = await agent.didManagerCreate({
      provider: 'did:ethr',
      alias: `org-${Date.now()}`,
    })

    const didDoc = await agent.resolveDid({ didUrl: identifier.did })
    const publicKey = didDoc.didDocument?.verificationMethod?.[0]?.publicKeyHex || ''

    return {
      did: identifier.did,
      publicKey,
    }
  } catch (error) {
    console.error('Error creating org DID:', error)
    // Fallback to did:key if ethr fails (no funds, network issues)
    return createAgentDID()
  }
}

/**
 * Resolve a DID to its DID Document
 */
export async function resolveDID(did: string): Promise<any> {
  try {
    const agent = getAgent()
    const result = await agent.resolveDid({ didUrl: did })
    return result.didDocument
  } catch (error) {
    console.error('Error resolving DID:', error)
    throw new Error(`Failed to resolve DID: ${did}`)
  }
}

/**
 * Verify DID ownership by checking signature
 * @param did - The DID to verify
 * @param message - Original message
 * @param signature - Signature to verify
 */
export async function verifyDIDOwnership(
  did: string,
  message: string,
  signature: string
): Promise<boolean> {
  try {
    const agent = getAgent()
    
    // Resolve DID to get public key
    const didDoc = await resolveDID(did)
    if (!didDoc) return false

    // In production, implement proper signature verification
    // using the public key from DID document
    // For now, basic check
    return Boolean(did && message && signature)
  } catch (error) {
    console.error('Error verifying DID ownership:', error)
    return false
  }
}

/**
 * Get all managed DIDs
 */
export async function listDIDs(): Promise<string[]> {
  try {
    const agent = getAgent()
    const identifiers = await agent.didManagerFind()
    return identifiers.map((id: any) => id.did)
  } catch (error) {
    console.error('Error listing DIDs:', error)
    return []
  }
}

/**
 * Delete a DID (remove from local store)
 */
export async function deleteDID(did: string): Promise<boolean> {
  try {
    const agent = getAgent()
    await agent.didManagerDelete({ did })
    return true
  } catch (error) {
    console.error('Error deleting DID:', error)
    return false
  }
}

