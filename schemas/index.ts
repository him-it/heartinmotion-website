import * as z from "zod";

export const AccountSchema = z.object({
    email: z.string().email({
        message: 'Please enter a valid email address.'
    }),
    first_name: z.string().min(1, {
        message: 'This field is required.'
    }),
    last_name: z.string().min(1, {
        message: 'This field is required.'
    }),
    address: z.string().min(1, {
        message: 'This field is required.'
    }),
    city: z.string().min(1, {
        message: 'This field is required.'
    }),
    zip: z.string({
        required_error: 'This field is required.',
    }).length(5, {
        message: 'ZIP code must be a 5-digit number.'
    }).regex(/^\d{5}$/, {
        message: 'ZIP code must be a valid 5-digit number.'
    }),
    cell_phone: z.string().refine((value) => /^\d{3}-\d{3}-\d{4}$/.test(value), {
        message: 'Please enter a valid phone number.'
    }),
    home_phone: z.string().refine((value) => /^\d{3}-\d{3}-\d{4}$/.test(value), {
        message: 'Please enter a valid phone number.'
    }),
    dob: z.coerce.date({
        message: 'This field is required.'
    }),
    vaccine_status: z.string().optional(),
    school: z.string().min(1, {
        message: 'This field is required.'
    }),
    homeroom: z.string().min(1, {
        message: 'This field is required.'
    }),
    graduating_year: z.string().min(1, {
        message: 'This field is required.'
    }).regex(/^\d{4}$/, {
        message: 'Please enter a valid year.'
    }),
    shirt_size: z.string().min(1, {
        message: 'This field is required.'
    }),
    activities: z.string().min(1, {
        message: 'This field is required.'
    }),
    comments: z.string().optional(),
    friends: z.string().min(1, {
        message: 'This field is required.'
    }),
    referrer: z.string().min(1, {
        message: 'This field is required.'
    }),
    emergency_contact_name: z.string().min(1, {
        message: 'This field is required.'
    }),
    emergency_contact_phone: z.string().min(1, {
        message: 'This field is required.'
    }).refine((value) => /^\d{3}-\d{3}-\d{4}$/.test(value), {
        message: 'Please enter a valid phone number.'
    }),
    emergency_contact_dob: z.coerce.date({
        message: 'This field is required.'
    }),
    twitter_url: z.string().min(1, {
        message: 'This field is required.'
    }),
});

export const EventSchema = z.object({
    name: z.string().min(1, {
        message: 'This field is required.'
    }),
    hidden: z.boolean()
})

export const RegisterSchema = z.object({
    transportation: z.string(),
    friends: z.string().optional()
})

export const ShiftSchema = z.object({
    description: z.string().min(1, {
        message: 'This field is required.'
    }),
    location: z.string().min(1, {
        message: 'This field is required.'
    }),
    spots: z.number({
        message: 'This field is required.'
    }),
    start_time: z
    .string()
    .refine(
      (value) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(value),
      {
        message:
          'This field is required.',
      },
    ),
    end_time: z
    .string()
    .refine(
      (value) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(value),
      {
        message:
          'This field is required.',
      },
    ),
    event_id: z.number().optional()
})

export const AddMemberSchema = z.object({
    id: z.string().min(1, {
        message: 'This field is required.'
    }),
    transportation: z.string().min(1, {
        message: 'This field is required.'
    })
})

export const MemberClubSchema = z.object({
    start_date: z.coerce.date({
        message: 'This field is required.'
    }),
    member_type: z.string().min(1, {
        message: 'This field is required.'
    }),
    in_him_group: z.boolean(),
    in_him_crew_group: z.boolean(),
    has_lanyard: z.boolean(),
    has_name_badge: z.boolean(),
    has_crew_neck: z.boolean(),
    has_tshirt: z.boolean(),
    has_long_sleeves: z.boolean(),
    has_hoodies: z.boolean(),
    contact: z.string().min(1, {
        message: 'This field is required.'
    }),
    contact_notes:  z.string().optional()
})

export const EditPageSchema = z.object({
    path: z.string().min(1, {
        message: 'This field is required.'
    })
})

export const AddManagerSchema = z.object({
    id: z.string().min(1, {
        message: 'This field is required.'
    }),
    admin_level: z.string().min(1, {
        message: 'This field is required.'
    })
})