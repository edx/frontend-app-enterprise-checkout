import { useParams } from 'react-router-dom';

function useCurrentStep() {
  const { step } = useParams<{ step: Step }>();
  return step;
}

export default useCurrentStep;
