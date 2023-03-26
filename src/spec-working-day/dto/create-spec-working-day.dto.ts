export class CreateSpecWorkingDayDto {
    spec_id: string;
    day_of_week: [Number];
    start_time: string;
    finish_time: string;
    rest_start_time?: string;
    rest_finish_time?: string;
}
