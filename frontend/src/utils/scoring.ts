// Utility functions for calculating match scores and compatibility

export interface SkillMatch {
  skill: string;
  weight: number;
  matched: boolean;
}

export interface CompatibilityScore {
  overall: number;
  skillsMatch: number;
  experienceMatch: number;
  locationMatch: number;
  salaryMatch: number;
  details: {
    matchedSkills: string[];
    missingSkills: string[];
    experienceGap: number;
  };
}

/**
 * Calculate compatibility score between a candidate and a job
 */
export function calculateCompatibilityScore(
  candidateSkills: string[],
  candidateYoe: number,
  candidateLocation: string,
  candidateExpectedCTC: number,
  jobStack: string[],
  jobMinYoe: number,
  jobLocation: string,
  jobSalaryMax: number,
  jobRemote: boolean = false
): CompatibilityScore {
  // Normalize strings for comparison
  const normalizeSkill = (skill: string) => skill.toLowerCase().trim();
  const normalizedCandidateSkills = candidateSkills.map(normalizeSkill);
  const normalizedJobStack = jobStack.map(normalizeSkill);

  // Skills matching (40% weight)
  const matchedSkills = normalizedCandidateSkills.filter(skill =>
    normalizedJobStack.includes(skill)
  );
  const missingSkills = normalizedJobStack.filter(skill =>
    !normalizedCandidateSkills.includes(skill)
  );
  
  const skillsMatchRatio = matchedSkills.length / normalizedJobStack.length;
  const skillsScore = Math.min(skillsMatchRatio * 100, 100);

  // Experience matching (25% weight)
  const experienceGap = Math.max(0, jobMinYoe - candidateYoe);
  const experienceScore = experienceGap === 0 ? 100 : Math.max(0, 100 - (experienceGap * 15));

  // Location matching (20% weight)
  const locationScore = jobRemote || 
    candidateLocation.toLowerCase().includes(jobLocation.toLowerCase()) ||
    jobLocation.toLowerCase().includes(candidateLocation.toLowerCase())
    ? 100 : 30; // Partial score for different locations

  // Salary matching (15% weight)
  const salaryScore = candidateExpectedCTC <= jobSalaryMax ? 100 : 
    Math.max(0, 100 - ((candidateExpectedCTC - jobSalaryMax) / jobSalaryMax * 100));

  // Overall score calculation
  const overallScore = Math.round(
    (skillsScore * 0.4) +
    (experienceScore * 0.25) +
    (locationScore * 0.2) +
    (salaryScore * 0.15)
  );

  return {
    overall: overallScore,
    skillsMatch: Math.round(skillsScore),
    experienceMatch: Math.round(experienceScore),
    locationMatch: Math.round(locationScore),
    salaryMatch: Math.round(salaryScore),
    details: {
      matchedSkills: matchedSkills,
      missingSkills: missingSkills,
      experienceGap: experienceGap,
    },
  };
}

/**
 * Determine if a match is worth showing to the user
 */
export function isViableMatch(score: CompatibilityScore): boolean {
  return score.overall >= 30 && score.skillsMatch >= 20;
}

/**
 * Get match quality description
 */
export function getMatchQuality(score: number): {
  label: string;
  color: string;
  description: string;
} {
  if (score >= 80) {
    return {
      label: 'Excellent Match',
      color: 'text-green-600',
      description: 'Highly compatible - great fit!'
    };
  } else if (score >= 60) {
    return {
      label: 'Good Match',
      color: 'text-blue-600',
      description: 'Strong compatibility'
    };
  } else if (score >= 40) {
    return {
      label: 'Decent Match',
      color: 'text-yellow-600',
      description: 'Some compatibility'
    };
  } else {
    return {
      label: 'Weak Match',
      color: 'text-red-600',
      description: 'Limited compatibility'
    };
  }
}

/**
 * Sort jobs/candidates by compatibility score
 */
export function sortByCompatibility<T extends { compatibilityScore?: number }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => 
    (b.compatibilityScore || 0) - (a.compatibilityScore || 0)
  );
}
