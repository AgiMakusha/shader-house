// Indie eligibility checker
export interface IndieEligibilityCheck {
  isEligible: boolean;
  reasons: string[];
  warnings: string[];
}

export interface DeveloperData {
  teamSize: number;
  hasPublisher: boolean;
  ownsIP: boolean;
  companyType: "NONE" | "SOLE_PROP" | "LLC" | "CORP";
  fundingSources: string[];
}

/**
 * Check if a developer meets indie criteria
 * 
 * Criteria:
 * - Team size ≤ 10
 * - No major publisher (distribution ok; no funding/control)
 * - Own their IP (or shared only among team)
 * - No corporate parent company
 */
export function checkIndieEligibility(data: DeveloperData): IndieEligibilityCheck {
  const reasons: string[] = [];
  const warnings: string[] = [];
  
  // Check team size
  if (data.teamSize > 10) {
    reasons.push(`Team size (${data.teamSize}) exceeds indie limit of 10`);
    warnings.push("Your team size may make you ineligible for Indie perks. You can still continue as a Studio.");
  }
  
  // Check publisher
  if (data.hasPublisher) {
    reasons.push("Has a major publisher with funding/control");
    warnings.push("Having a major publisher may make you ineligible for Indie perks. You can still continue as a Studio.");
  }
  
  // Check IP ownership
  if (!data.ownsIP) {
    reasons.push("Does not own IP for main title");
  }
  
  // Check company type (CORP with parent company is not indie)
  if (data.companyType === "CORP") {
    // Note: Small corps can still be indie if they meet other criteria
    warnings.push("Corporate structure detected. Ensure you don't have a parent company to maintain indie status.");
  }
  
  // Check funding sources
  if (data.fundingSources.includes("MAJOR_PUBLISHER")) {
    reasons.push("Received funding from major publisher");
  }
  
  if (data.fundingSources.includes("VC") && data.teamSize > 10) {
    warnings.push("VC funding combined with large team size may indicate non-indie status.");
  }
  
  const isEligible = reasons.length === 0;
  
  return {
    isEligible,
    reasons,
    warnings,
  };
}

/**
 * Get indie policy text
 */
export const INDIE_POLICY = {
  title: "What makes you 'Indie'?",
  criteria: [
    "Team size of 10 or fewer",
    "No major publisher with funding/control (distribution partnerships are OK)",
    "You own your IP, or share it only among your team",
    "No corporate parent company",
  ],
  note: "Having a studio name, sole proprietorship, or small LLC is common and allowed for indie developers.",
};

/**
 * Field tooltips
 */
export const FIELD_TOOLTIPS = {
  developerType: "Select 'Indie' if you meet the indie criteria, or 'Studio' if you have a larger team or publisher backing.",
  teamSize: "Total number of people working on your main project, including part-time contributors.",
  hasPublisher: "Do you have a major publisher that provides funding or has creative control? (Distribution-only partnerships don't count)",
  ownsIP: "Do you own the intellectual property rights for your main game title, or share them only with your team?",
  fundingSources: "Select all funding sources you've used. Self-funding and crowdfunding are common for indies.",
  companyType: "Your legal business structure. Many indies operate as sole proprietors or LLCs.",
  evidenceLinks: "Provide links to your game's store page, website, GitHub, or professional profiles to verify your work.",
  attestIndie: "By checking this, you certify that you meet the indie criteria and understand that false information may result in account suspension.",
};

