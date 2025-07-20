interface QuestionnaireData {
  traits?: string[];
  anchors?: number[];
}

export function formatQuestionnaireProgress(data: QuestionnaireData) {
  const totalTraits = 10; // Maximum traits allowed
  const totalAnchors = 18; // Total number of anchor questions

  const traitsCount = data.traits?.length || 0;
  const anchorsCount = data.anchors?.filter(Boolean).length || 0;

  const traitsProgress = Math.min((traitsCount / totalTraits) * 100, 100);
  const anchorsProgress = (anchorsCount / totalAnchors) * 100;

  return {
    traits: {
      completed: traitsCount,
      total: totalTraits,
      percentage: Math.round(traitsProgress),
      remaining: totalTraits - traitsCount,
    },
    anchors: {
      completed: anchorsCount,
      total: totalAnchors,
      percentage: Math.round(anchorsProgress),
      remaining: totalAnchors - anchorsCount,
    },
    total: {
      completed: traitsCount + anchorsCount,
      total: totalTraits + totalAnchors,
      percentage: Math.round((traitsProgress + anchorsProgress) / 2),
    },
    isComplete: traitsCount > 0 && anchorsCount === totalAnchors,
  };
}

export function formatTraitSelection(traits: string[]) {
  const maxTraits = 10;
  return {
    selected: traits.length,
    remaining: maxTraits - traits.length,
    canAdd: traits.length < maxTraits,
    percentage: Math.round((traits.length / maxTraits) * 100),
  };
}

export function validateQuestionnaireData(data: QuestionnaireData) {
  const errors: string[] = [];

  // Validate traits
  if (!data.traits || data.traits.length === 0) {
    errors.push("יש לבחור לפחות תכונה אחת");
  } else if (data.traits.length > 10) {
    errors.push("ניתן לבחור עד 10 תכונות");
  }

  // Validate anchors
  if (!data.anchors || data.anchors.length !== 18) {
    errors.push("יש להשלים את כל שאלון עוגני הקריירה");
  } else if (data.anchors.some(val => val === undefined || val < 0 || val > 10)) {
    errors.push("כל הערכים בשאלון צריכים להיות בין 0 ל-10");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
