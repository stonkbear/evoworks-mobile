/**
 * Policy Templates - Pre-configured policy packs for common use cases
 * HIPAA, GDPR, FINRA, and general enterprise security
 */

export const POLICY_TEMPLATES = {
  HIPAA_COMPLIANCE: {
    name: 'HIPAA Compliance Pack',
    description: 'Healthcare data protection and privacy compliance',
    rules: {
      dataResidency: `
        package echo.hipaa.residency
        
        default allow = false
        
        allow {
          input.task.requirements.dataClass == "PHI"
          input.agent.region == "US"
          hipaa_compliant
        }
        
        hipaa_compliant {
          some vc
          input.agent.credentials[vc].type == "HIPAA_COMPLIANT"
          input.agent.credentials[vc].revoked == false
        }
        
        deny_reason["PHI data requires HIPAA compliant agent"] {
          input.task.requirements.dataClass == "PHI"
          not hipaa_compliant
        }
      `,
      
      toolPermissions: `
        package echo.hipaa.tools
        
        default allow = true
        
        deny {
          input.task.requirements.dataClass == "PHI"
          contains_pii_extraction_tool
        }
        
        contains_pii_extraction_tool {
          some tool
          input.agent.capabilities.tools[tool] == "pii_extractor"
        }
        
        deny_reason["PHI tasks cannot use PII extraction tools"] {
          contains_pii_extraction_tool
        }
      `,
      
      reputationThreshold: `
        package echo.hipaa.reputation
        
        default allow = true
        
        deny {
          input.task.requirements.dataClass == "PHI"
          input.agent.reputationScores[0].complianceScore < 85
        }
        
        deny_reason["PHI tasks require compliance score >= 85"] {
          input.agent.reputationScores[0].complianceScore < 85
        }
      `,
    },
  },

  GDPR_COMPLIANCE: {
    name: 'GDPR Compliance Pack',
    description: 'EU data protection and privacy regulations',
    rules: {
      dataResidency: `
        package echo.gdpr.residency
        
        default allow = false
        
        allow {
          input.task.requirements.region == "EU"
          input.agent.region == "EU"
          gdpr_compliant
        }
        
        allow {
          input.task.requirements.region != "EU"
        }
        
        gdpr_compliant {
          some vc
          input.agent.credentials[vc].type == "GDPR_COMPLIANT"
          input.agent.credentials[vc].revoked == false
        }
        
        deny_reason["EU data must be processed by EU-based GDPR compliant agents"] {
          input.task.requirements.region == "EU"
          not gdpr_compliant
        }
      `,
      
      toolPermissions: `
        package echo.gdpr.tools
        
        default allow = true
        
        deny {
          input.task.requirements.dataClass == "PII"
          not data_minimization_enabled
        }
        
        data_minimization_enabled {
          input.agent.capabilities.features.dataMinimization == true
        }
        
        deny_reason["GDPR requires data minimization for PII"] {
          not data_minimization_enabled
        }
      `,
      
      retentionPolicy: `
        package echo.gdpr.retention
        
        default allow = true
        
        deny {
          input.task.requirements.dataClass == "PII"
          input.task.requirements.retentionDays > 90
        }
        
        deny_reason["GDPR limits PII retention to 90 days without justification"] {
          input.task.requirements.retentionDays > 90
        }
      `,
    },
  },

  FINRA_COMPLIANCE: {
    name: 'FINRA Compliance Pack',
    description: 'Financial services regulatory compliance',
    rules: {
      auditTrail: `
        package echo.finra.audit
        
        default allow = true
        
        deny {
          input.task.requirements.industry == "finance"
          not audit_enabled
        }
        
        audit_enabled {
          input.agent.capabilities.features.fullAuditTrail == true
        }
        
        deny_reason["Financial tasks require full audit trail capability"] {
          not audit_enabled
        }
      `,
      
      dataResidency: `
        package echo.finra.residency
        
        default allow = false
        
        allow {
          input.task.requirements.industry == "finance"
          input.agent.region == "US"
          finra_certified
        }
        
        finra_certified {
          some vc
          input.agent.credentials[vc].type == "SOC2_COMPLIANT"
          input.agent.credentials[vc].revoked == false
        }
        
        deny_reason["Financial tasks require US-based SOC2 compliant agents"] {
          not finra_certified
        }
      `,
      
      spendLimits: `
        package echo.finra.spend
        
        default allow = true
        
        deny {
          input.task.maxBudget > 100000
          not high_value_approved
        }
        
        high_value_approved {
          input.task.approvals[_].type == "HIGH_VALUE"
          input.task.approvals[_].status == "APPROVED"
        }
        
        deny_reason["Tasks >$100K require high-value approval"] {
          input.task.maxBudget > 100000
          not high_value_approved
        }
      `,
    },
  },

  ENTERPRISE_SECURITY: {
    name: 'Enterprise Security Pack',
    description: 'General enterprise security and governance',
    rules: {
      dataResidency: `
        package echo.enterprise.residency
        
        default allow = true
        
        deny {
          input.task.requirements.region != ""
          input.agent.region != input.task.requirements.region
        }
        
        deny_reason["Region mismatch: task requires specific region"] {
          input.task.requirements.region != input.agent.region
        }
      `,
      
      reputationThreshold: `
        package echo.enterprise.reputation
        
        default allow = true
        
        deny {
          input.agent.reputationScores[0].overallScore < 60
        }
        
        deny_reason["Agent reputation below minimum threshold (60)"] {
          input.agent.reputationScores[0].overallScore < 60
        }
      `,
      
      stakeRequirement: `
        package echo.enterprise.stake
        
        default allow = true
        
        deny {
          input.task.maxBudget > 5000
          agent_total_stake < required_stake
        }
        
        required_stake = input.task.maxBudget * 0.1
        
        agent_total_stake = sum([s.amount | s = input.agent.stakePositions[_]; s.status == "ACTIVE"])
        
        deny_reason["Insufficient stake for task value"] {
          agent_total_stake < required_stake
        }
      `,
      
      blacklist: `
        package echo.enterprise.blacklist
        
        default allow = true
        
        deny {
          is_blacklisted
        }
        
        is_blacklisted {
          input.organization.blacklist[_] == input.agent.id
        }
        
        deny_reason["Agent is blacklisted by organization"] {
          is_blacklisted
        }
      `,
    },
  },

  MINIMAL: {
    name: 'Minimal Policy Pack',
    description: 'Basic security with minimal restrictions',
    rules: {
      basic: `
        package echo.minimal
        
        default allow = true
        
        deny {
          input.agent.status != "ACTIVE"
        }
        
        deny_reason["Agent is not active"] {
          input.agent.status != "ACTIVE"
        }
      `,
    },
  },
}

/**
 * Get template by name
 */
export function getPolicyTemplate(name: keyof typeof POLICY_TEMPLATES): any {
  return POLICY_TEMPLATES[name]
}

/**
 * List all available templates
 */
export function listPolicyTemplates(): Array<{
  name: string
  description: string
}> {
  return Object.entries(POLICY_TEMPLATES).map(([key, template]) => ({
    name: template.name,
    description: template.description,
  }))
}

