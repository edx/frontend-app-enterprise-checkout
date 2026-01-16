import type { UseFormReturn } from 'react-hook-form';

interface EssentialsAcademicSelectionContentProps {
  form: UseFormReturn<EssentialAcademicSelectionData>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EssentialsAcademicSelectionContent = ({ form: _form }: EssentialsAcademicSelectionContentProps) => (
  <>
    Essentials Academic Selection
  </>
);

export default EssentialsAcademicSelectionContent;
