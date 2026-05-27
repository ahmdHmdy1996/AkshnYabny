import { useRouter } from 'expo-router';
import { useGameStore } from '../../../store/useGameStore';

interface SetupValidation {
  isValid: boolean;
  errors: {
    teamA?: string;
    teamB?: string;
    categories?: string;
  };
}

export function useSetupForm() {
  const router = useRouter();
  const {
    teamA,
    teamB,
    selectedCategories,
    crazyRulesEnabled,
    maxRounds,
    setTeamName,
    toggleCategory,
    toggleCrazyRules,
    setMaxRounds,
    setPhase,
    isSoundEnabled,
    toggleSound,
  } = useGameStore();

  const validate = (): SetupValidation => {
    const errors: SetupValidation['errors'] = {};
    if (!teamA.name.trim()) errors.teamA = 'أدخل اسم الفريق الأول';
    if (!teamB.name.trim()) errors.teamB = 'أدخل اسم الفريق الثاني';
    if (selectedCategories.length === 0) errors.categories = 'اختار فئة واحدة على الأقل';
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const handleStartGame = (): SetupValidation['errors'] | null => {
    const { isValid, errors } = validate();
    if (!isValid) return errors;
    setPhase('playing');
    router.push('/game');
    return null;
  };

  return {
    teamA,
    teamB,
    selectedCategories,
    crazyRulesEnabled,
    maxRounds,
    isSoundEnabled,
    setTeamName,
    toggleCategory,
    toggleCrazyRules,
    setMaxRounds,
    toggleSound,
    handleStartGame,
  };
}
