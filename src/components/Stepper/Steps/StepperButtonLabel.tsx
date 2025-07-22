import { useParams } from 'react-router';

const StepperButtonLabel = () => {
  const { step, substep } = useParams();
  return (<div>label</div>);
};

export default StepperButtonLabel;
