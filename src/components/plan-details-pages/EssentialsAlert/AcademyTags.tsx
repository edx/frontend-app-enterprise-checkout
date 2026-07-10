interface AcademyTag {
  id: number;
  title: string;
}

interface AcademyTagsProps {
  tags: readonly AcademyTag[];
}

const AcademyTags = ({ tags }: AcademyTagsProps) => {
  if (tags.length === 0) {
    return null;
  }

  return (
    <ul className="essentials-alert__tags">
      {tags.map(({ id, title }) => (
        <li key={id} className="essentials-alert__tag">{title}</li>
      ))}
    </ul>
  );
};

export default AcademyTags;
