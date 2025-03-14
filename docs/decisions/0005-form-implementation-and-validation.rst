5. Form Implementation and Validation
-------------------------------------

Status
------

Accepted (March 2025)

Context
-------

As the project scales, we need a robust and scalable way to handle form implementation and validation. Existing solutions have led to challenges with boilerplate code, validation logic duplication, and maintaining consistent validation rules across the application. Manual form handling and validation have proven to be cumbersome and error-prone.

The team needs a solution that simplifies form management, reduces boilerplate, and ensures maintainable and consistent validation. Given that React is the framework of choice for the front-end, a library that integrates well with React, is lightweight, and reduces the need for repetitive validation code would be ideal.

**Key Requirements:**
- **Simplicity**: The solution should reduce the amount of boilerplate code for form management.
- **Declarative Validation**: Validation should be easy to define and maintain, ensuring consistency across forms.
- **Type Safety**: With TypeScript usage, the solution should offer strong typing to ensure safety across form fields and validation logic.
- **Performance**: The solution should not introduce unnecessary re-renders or performance overhead.

Decision
--------

Adopt `react-hook-form` for form management and `zod` for form validation.

- **`react-hook-form`** will be used to handle form state, form submission, and field-level validation. It is lightweight, minimizes re-renders, and integrates easily with React's native forms, providing a simple API for managing form state.

- **`zod`** will be used to handle schema-based validation. `zod` integrates well with `react-hook-form`, provides a clean and type-safe way to validate form data, and enforces strong typing through TypeScript.

**Implementation Plan:**
- Forms will be implemented using `useForm` from `react-hook-form` to manage field values and submission.
- Validation schemas will be created using `zod` to define the structure of form data and validate input.
- Form submissions will rely on the built-in `onSubmit` handler from `react-hook-form`, using the schema validation from `zod`.

Example implementation:

.. code-block:: tsx

  // Example of a form using react-hook-form and zod for validation
  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { z } from "zod";

  // Define the schema
  const schema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
  });

  const MyForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm({
      resolver: zodResolver(schema),
    });

    const onSubmit = data => console.log(data);

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("name")} placeholder="Name" />
        {errors.name && <p>{errors.name.message}</p>}
        <input {...register("email")} placeholder="Email" />
        {errors.email && <p>{errors.email.message}</p>}
        <button type="submit">Submit</button>
      </form>
    );
  };
