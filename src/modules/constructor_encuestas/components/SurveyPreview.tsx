import React from 'react';
import { EncuestaMeta } from '../types';
import { DynamicSurveyEngine } from './DynamicSurveyEngine';

interface SurveyPreviewProps {
  encuesta: EncuestaMeta | string;
  empresaId: string;
  onBack: () => void;
  isTestMode?: boolean;
}

export function SurveyPreview({ encuesta, empresaId, onBack, isTestMode = true }: SurveyPreviewProps) {
  return (
    <DynamicSurveyEngine
      encuesta={encuesta}
      empresaId={empresaId}
      onBack={onBack}
      isTestMode={isTestMode}
    />
  );
}
