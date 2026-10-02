export type ReviewImage = {
  id: number;
  image: string;
  caption: string | null;
};

export type Review = {
  id: number;
  booking_id: number;
  booking_code: string;
  service_name: string;
  worker: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    avatar: string | null;
  };
  schedule: { id: number; sequence_no: number; scheduled_start: string };
  rating: number;
  comment: string | null;
  images: ReviewImage[];
  admin_reply: string | null;
  replied_at: string | null;
  is_visible: boolean;
  created_at: string;
  edited_at: string | null;
  is_edited: boolean;
  can_edit: boolean;
  edit_deadline: string;
  max_images: number;
};

export type ReviewPickedImage = { uri: string; name: string; type: string };

export type AssignmentReviewState = {
  assignment: {
    assignment_id: number;
    booking_id: number;
    booking_code: string;
    service_name: string;
    worker: Review["worker"];
    schedule: Review["schedule"];
  };
  can_review: boolean;
  review: Review | null;
  max_images: number;
};
