import type { UseFormReturn } from "react-hook-form";

interface EssentialsAcademicSelectionContentProps {
  form: UseFormReturn<AccountDetailsData>;
}

const EssentialsAcademicSelectionContent = ({ form }: EssentialsAcademicSelectionContentProps) => {
  console.log('Essentials Academic Selection Content', form);
  return (
    <>
      Essentials Academic Selection
    </>
  );
};


export default EssentialsAcademicSelectionContent;
