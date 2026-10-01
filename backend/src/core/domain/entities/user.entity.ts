import { Course } from './course.entity';

export interface UserProps {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  courses?: Course[];
  createdAt?: Date;
}

export class User {
  readonly id: string;
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly courses: Course[];
  readonly createdAt?: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.password = props.password;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.courses = props.courses ?? [];
    this.createdAt = props.createdAt;
  }
}
