export interface CourseProps {
  id: string;
  name: string;
  professor?: string | null;
  section?: string | null;
  userId: string;
}

export class Course {
  readonly id: string;
  readonly name: string;
  readonly professor?: string | null;
  readonly section?: string | null;
  readonly userId: string;

  constructor(props: CourseProps) {
    this.id = props.id;
    this.name = props.name;
    this.professor = props.professor;
    this.section = props.section;
    this.userId = props.userId;
  }
}
