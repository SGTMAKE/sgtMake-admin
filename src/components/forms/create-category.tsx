import { Button, Input } from "@nextui-org/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ZodCategorySchema } from "@/lib/zod-schemas/schema";
import { useCreateCategory } from "@/api-hooks/categories/create-category";
import {  Select, SelectItem, Textarea } from "@nextui-org/react";
import { useCategories } from "@/api-hooks/categories/get-categories";

const CreateCategoryForm = ({ onClose }: { onClose: () => void }) => {
  const { data: categories } = useCategories();
  const form = useForm<z.infer<typeof ZodCategorySchema>>({
    resolver: zodResolver(ZodCategorySchema),
    defaultValues: {
      category: "",
      description: "",
    },
  });

  const onSuccess = () => {
    toast.success("New Category created successfully.");
    onClose();
  };

  const mutation = useCreateCategory(onSuccess);

  async function handleCreateAdmin(data: z.infer<typeof ZodCategorySchema>) {
    mutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleCreateAdmin)}>
        <div className="mb-1 flex flex-col gap-1">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="Name" {...field} radius="sm" size="sm" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem className="max-w-[120px]">
                <FormControl>
                  <Input
                    placeholder="Parent ID"
                    type="text"
                    {...field}
                    radius="sm"
                    size="sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
       
           <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="mt-3">
            <FormControl>
              <Textarea
                placeholder="Description"
                label="Description"
                labelPlacement="outside"
                radius="sm"
                variant="faded"
                classNames={{
                  label: "text-sm font-medium z-0",
                  inputWrapper:
                    "border border-slate-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-800/50",
                }}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
         <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  placeholder="Select a category"
                  label="Parent Category (optional) "
                  labelPlacement="outside"
                  onChange={field.onChange}
                  selectedKeys={field.value ? [field.value] : []}
                  radius="sm"
                  variant="bordered"
                  classNames={{
                    label: "text-sm font-medium z-0",
                    trigger:
                      "border border-slate-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-800/50 mt-1 h-unit-10",
                  }}
                >
                  {categories ? (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem key={1} value={"empty"}>
                      No items to select!
                    </SelectItem>
                  )}
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <div className="mt-6 flex items-center justify-end gap-4">
          <Button
            color="danger"
            type="button"
            variant="light"
            onPress={onClose}
          >
            Close
          </Button>
          <Button color="primary" type="submit" isLoading={mutation.isPending}>
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateCategoryForm;
