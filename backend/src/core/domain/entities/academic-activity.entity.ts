export type ActivityStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type ActivityPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type ActivitySource = 'MANUAL' | 'CLASSROOM';

export interface AcademicActivityProps {
  id: string;
  title: string;
  description?: string;
  course: string;
  dueDate: Date;
  status: ActivityStatus;
  priority: ActivityPriority;
  source: ActivitySource;
}

export class AcademicActivity {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly course: string;
  readonly dueDate: Date;
  readonly status: ActivityStatus;
  readonly priority: ActivityPriority;
  readonly source: ActivitySource;

  constructor(props: AcademicActivityProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.course = props.course;
    this.dueDate = props.dueDate;
    this.status = props.status;
    this.priority = props.priority;
    this.source = props.source;
  }
}
