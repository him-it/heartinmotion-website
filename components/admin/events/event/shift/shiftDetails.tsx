"use client";

import {
  completeAllMembers,
  confirmAllMembers,
  deleteShiftData,
  getShiftById,
  shiftAddMember,
  shiftDeleteMember,
  updateShift,
  updateShiftCompleted,
  updateShiftConfirmed,
  updateShiftHours,
  updateShiftHoursAll,
} from "@/actions/admin/event";
import { events_eventshift, Prisma } from "@prisma/client";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { AddMemberSchema, ShiftSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/formError";
import { getMemberNames } from "@/actions/admin/member";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Modal, TableShell, Toolbar, ToolbarSpacer, tdClass, thClass } from "@/components/admin/workbench";
import { formatShiftDate, formatShiftTime, shiftTimeToInputValue } from "@/lib/time";

const AdminShiftDetails = ({
  shiftData,
  memberData,
}: {
  shiftData: Prisma.PromiseReturnType<typeof getShiftById> | undefined;
  memberData: Prisma.PromiseReturnType<typeof getMemberNames>;
}) => {
  const [showEditShiftPopup, setShowEditShiftPopup] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);
  const [addMemberError, setAddMemberError] = useState<string | undefined>(
    undefined
  );
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [updatedData, setUpdatedData] = useState<
    Prisma.PromiseReturnType<typeof getShiftById>
  >(
    shiftData
      ? shiftData
      : ({} as Prisma.PromiseReturnType<typeof getShiftById>)
  );
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const form = useForm<z.infer<typeof ShiftSchema>>({
    resolver: zodResolver(ShiftSchema),
    defaultValues: {
      description: "",
      location: "",
      spots: 0,
      start_time: new Date(
        new Date(new Date().setHours(0, 0, 0, 0)).getTime() +
          new Date().getTimezoneOffset() * -60 * 1000
      )
        .toISOString()
        .slice(0, 19),
      end_time: new Date(
        new Date(new Date().setHours(0, 0, 0, 0)).getTime() +
          new Date().getTimezoneOffset() * -60 * 1000
      )
        .toISOString()
        .slice(0, 19),
    },
  });

  const addMemberForm = useForm<z.infer<typeof AddMemberSchema>>({
    resolver: zodResolver(AddMemberSchema),
    defaultValues: {
      id: "",
      transportation: "",
    },
  });

  const addMember: SubmitHandler<z.infer<typeof AddMemberSchema>> = (data) => {
    startTransition(() => {
      shiftAddMember(data, shiftData as events_eventshift)
        .then(() => {
          window.location.reload();
        })
        .catch(() => {
          setError("An unexpected error occurred.");
        });
    });
  };

  const deleteShift = () => {
    if (
      prompt(
        'Are you sure about deleting this shift? \nAll data and hours will be ERASED. \nPlease type "I am sure about deleting this shift."'
      ) === "I am sure about deleting this shift."
    )
      if (shiftData?.id && shiftData?.events_event) {
        deleteShiftData(shiftData.id)
          .then((res) => {
            if (res?.error) {
              setError(res.error);
              return;
            }
            window.location.replace(
              "/admin/events/event/" + shiftData?.events_event.slug
            );
          })
          .catch(() => {
            setError("An unexpected error occurred.");
          });
      }
  };

  const editShift: SubmitHandler<z.infer<typeof ShiftSchema>> = (data) => {
    startTransition(() => {
      updateShift(data, shiftData?.id ? shiftData.id : NaN)
        .then(() => {
          window.location.reload();
        })
        .catch(() => {
          setError("An unexpected error occurred.");
        });
    });
  };

  const deleteMember = (id: number, name: string) => {
    if (
      confirm("Are you sure you want to remove " + name + " from this shift?")
    )
      shiftDeleteMember(id)
        .then(() => {
          if (updatedData)
            setUpdatedData({
              ...updatedData,
              events_eventshiftmember:
                updatedData.events_eventshiftmember.filter(
                  (shift) => shift.id !== id
                ),
            });
          else window.location.reload();
        })
        .catch(() => {
          setError("An unexpected error occurred.");
        });
  };

  const changeConfirmed = (id: number, value: boolean) => {
    startTransition(() => {
      updateShiftConfirmed(id, value)
        .then(() => {
          if (updatedData) {
            const updatedMemberData = updatedData.events_eventshiftmember.map(
              (shift) => {
                if (typeof value === "boolean" && shift?.id === id)
                  return { ...shift, confirmed: value };
                return shift;
              }
            );
            setUpdatedData({
              ...updatedData,
              events_eventshiftmember: updatedMemberData,
            });
          } else window.location.reload();
        })
        .catch(() => {
          setError("An unexpected error occurred.");
        });
    });
  };

  const changeCompleted = (id: number, value: boolean) => {
    startTransition(() => {
      updateShiftCompleted(id, value)
        .then(() => {
          if (updatedData) {
            const updatedMemberData = updatedData.events_eventshiftmember.map(
              (shift) => {
                if (typeof value === "boolean" && shift.id === id)
                  return { ...shift, completed: value };
                return shift;
              }
            );
            setUpdatedData({
              ...updatedData,
              events_eventshiftmember: updatedMemberData,
            });
          } else window.location.reload();
        })
        .catch(() => {
          setError("An unexpected error occurred.");
        });
    });
  };

  const changeHours = (id: number, value: number) => {
    startTransition(() => {
      updateShiftHours(id, value)
        .then(() => {
          if (updatedData) {
            const updatedMemberData = updatedData.events_eventshiftmember.map(
              (shift) => {
                if (value && shift?.id === id)
                  return { ...shift, hours: value };
                return shift;
              }
            );
            setUpdatedData({
              ...updatedData,
              events_eventshiftmember: updatedMemberData,
            });
          } else window.location.reload();
        })
        .catch(() => {
          setError("An unexpected error occurred.");
        });
    });
  };

  const changeHoursAll = (id: number, value: number) => {
    startTransition(() => {
      updateShiftHoursAll(id, value)
        .then(() => {
          window.location.reload();
        })
        .catch(() => {
          setError("An unexpected error occurred.");
        });
    });
  };

  const confirmAll = () => {
    if (confirm("Are you sure you want to confirm all members?"))
      startTransition(() => {
        if (shiftData?.id)
          confirmAllMembers(shiftData.id)
            .then(() => {
              window.location.reload();
            })
            .catch(() => {
              setError("An unexpected error occurred.");
            });
      });
  };

  const completeAll = () => {
    if (confirm("Are you sure you want to complete all members?"))
      startTransition(() => {
        if (shiftData?.id)
          completeAllMembers(shiftData.id)
            .then(() => {
              window.location.reload();
            })
            .catch(() => {
              setError("An unexpected error occurred.");
            });
      });
  };

  useEffect(() => {
    if (shiftData) setUpdatedData(shiftData);

    if (shiftData && shiftData.start_time && shiftData.end_time) {
      form.reset({
        description: shiftData.description,
        location: shiftData.location,
        spots: shiftData.spots,
        start_time: shiftTimeToInputValue(shiftData.start_time),
        end_time: shiftTimeToInputValue(shiftData.end_time),
      });
    }
  }, [shiftData, form]);

  const sortedMembers = useMemo(() => {
    if (!updatedData?.events_eventshiftmember) return [];
    const members = [...updatedData.events_eventshiftmember];
    if (sortConfig !== null) {
      members.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.key) {
          case "name":
            aValue =
              a.member_member.first_name + " " + a.member_member.last_name;
            bValue =
              b.member_member.first_name + " " + b.member_member.last_name;
            break;
          case "phone":
            aValue = a.member_member.cell_phone;
            bValue = b.member_member.cell_phone;
            break;
          case "school":
            aValue = a.member_member.school;
            bValue = b.member_member.school;
            break;
          case "graduatingYear":
            aValue = a.member_member.graduating_year;
            bValue = b.member_member.graduating_year;
            break;
          case "confirmed":
            aValue = a.confirmed;
            bValue = b.confirmed;
            break;
          case "completed":
            aValue = a.completed;
            bValue = b.completed;
            break;
          case "hours":
            aValue = a.hours;
            bValue = b.hours;
            break;
          default:
            aValue = "";
            bValue = "";
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return members;
  }, [updatedData, sortConfig]);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="w-full">
      <Toolbar>
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => { confirmAll(); }}>
          Mark All Confirmed
        </Button>
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => { completeAll(); }}>
          Mark All Completed
        </Button>
        <input
          className="h-9 w-44 rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Set all hours  ⏎"
          onKeyDown={(e) => {
            if (shiftData?.id && e.key === "Enter") {
              const target = e.target as HTMLInputElement;
              changeHoursAll(shiftData.id, Number(target.value));
            }
          }}
        ></input>
        <ToolbarSpacer />
        <Button size="sm" variant="outline" onClick={() => setShowEditShiftPopup(true)}>
          Edit Shift
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => { deleteShift(); }}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          Delete Shift
        </Button>
      </Toolbar>
      {updatedData && (
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                Shift Details
              </h2>
              <h3 className="text-lg font-semibold text-foreground">{updatedData.description}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {updatedData.start_time &&
                  formatShiftDate(updatedData.start_time)}
              </p>
              <p className="text-sm text-muted-foreground">
                {updatedData.start_time &&
                  formatShiftTime(updatedData.start_time)}{" "}
                -{" "}
                {updatedData.end_time &&
                  formatShiftTime(updatedData.end_time)}
              </p>
              <p className="text-sm text-muted-foreground">{updatedData.location}</p>
              <div className="mt-5 font-semibold text-sm">
                {updatedData.events_eventshiftmember?.length >=
                updatedData.spots ? (
                  <div className="text-primary">
                    <p>SHIFT FULL!</p>
                    <p>
                      {updatedData.spots -
                        updatedData.events_eventshiftmember?.length +
                        " available + " +
                        updatedData.events_eventshiftmember?.length +
                        " filled = " +
                        updatedData.spots}
                    </p>
                  </div>
                ) : (
                  <p className="text-foreground">
                    {updatedData.spots -
                      updatedData.events_eventshiftmember?.length +
                      " available + " +
                      updatedData.events_eventshiftmember?.length +
                      " filled = " +
                      updatedData.spots +
                      " total"}
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                Add a Member
              </h2>
              <Form {...addMemberForm}>
                <form onSubmit={addMemberForm.handleSubmit(addMember)} className="space-y-5">
                  <FormField
                    control={addMemberForm.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Member Name:</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            disabled={isPending}
                            className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option></option>
                            {memberData &&
                              memberData.length > 0 &&
                              memberData.map((member) => (
                                <option key={member.id} value={member.id}>
                                  {member.first_name + " " + member.last_name}
                                </option>
                              ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addMemberForm.control}
                    name="transportation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transportation:</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder=""
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {addMemberError && <FormError message={addMemberError} />}
                  <div className="flex justify-end pt-1">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isPending}
                    >
                      Add Member
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
          <div className="w-full">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Members
            </h2>
            <TableShell>
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th
                    className={thClass + " cursor-pointer select-none"}
                    onClick={() => requestSort("name")}
                  >
                    Name
                    {sortConfig?.key === "name" && (
    <span className="text-muted-foreground">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
  )}
                  </th>
                  <th
                    className={thClass + " cursor-pointer select-none"}
                    onClick={() => requestSort("phone")}
                  >
                    Phone
                    {sortConfig?.key === "phone" && (
    <span className="text-muted-foreground">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
  )}
                  </th>
                  <th
                    className={thClass + " cursor-pointer select-none"}
                    onClick={() => requestSort("school")}
                  >
                    School
                    {sortConfig?.key === "school" && (
    <span className="text-muted-foreground">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
  )}
                  </th>
                  <th
                    className={thClass + " cursor-pointer select-none"}
                    onClick={() => requestSort("graduatingYear")}
                  >
                    Graduating Year
                    {sortConfig?.key === "graduatingYear" && (
    <span className="text-muted-foreground">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
  )}
                  </th>
                  <th
                    className={thClass + " cursor-pointer select-none text-center"}
                    onClick={() => requestSort("confirmed")}
                  >
                    Confirmed
                    {sortConfig?.key === "confirmed" && (
    <span className="text-muted-foreground">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
  )}
                  </th>
                  <th
                    className={thClass + " cursor-pointer select-none text-center"}
                    onClick={() => requestSort("completed")}
                  >
                    Completed
                    {sortConfig?.key === "completed" && (
    <span className="text-muted-foreground">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
  )}
                  </th>
                  <th
                    className={thClass + " cursor-pointer select-none"}
                    onClick={() => requestSort("hours")}
                  >
                    Hours
                    {sortConfig?.key === "hours" && (
    <span className="text-muted-foreground">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
  )}
                  </th>
                  <th className={thClass + " text-right"}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {updatedData.events_eventshiftmember?.length > 0 &&
                  sortedMembers.map((member) => (
                    <tr key={member.id} className="border-b border-border last:border-0 hover:bg-muted/60 transition-colors">
                      <td className={tdClass + " font-medium"}>
                        <Link
                          href={"/admin/members/member/" + member.member_id}
                          className="text-primary hover:underline hover:text-primary/90"
                        >
                          {member.member_member.first_name +
                            " " +
                            member.member_member.last_name}
                        </Link>
                      </td>
                      <td className={tdClass + " text-muted-foreground whitespace-nowrap"}>
                        {member.member_member.cell_phone}
                      </td>
                      <td className={tdClass + " text-muted-foreground"}>
                        {member.member_member.school}
                      </td>
                      <td className={tdClass + " text-muted-foreground"}>
                        {member.member_member.graduating_year}
                      </td>
                      <td className={tdClass + " text-center"}>
                        <button
                          disabled={isPending}
                          className={
                            (member.confirmed
                              ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                              : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground") +
                            " inline-flex rounded-full px-3 py-0.5 text-xs font-semibold transition-colors disabled:opacity-50"
                          }
                          onClick={() => {
                            changeConfirmed(member.id, !member.confirmed);
                          }}
                        >
                          {member.confirmed ? "Yes" : "No"}
                        </button>
                      </td>
                      <td className={tdClass + " text-center"}>
                        <button
                          disabled={isPending}
                          className={
                            (member.completed
                              ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                              : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground") +
                            " inline-flex rounded-full px-3 py-0.5 text-xs font-semibold transition-colors disabled:opacity-50"
                          }
                          onClick={() => {
                            changeCompleted(member.id, !member.completed);
                          }}
                        >
                          {member.completed ? "Yes" : "No"}
                        </button>
                      </td>
                      <td className={tdClass}>
                        <input
                          type="number"
                          defaultValue={member.hours}
                          disabled={isPending}
                          className="h-8 w-20 rounded-md border border-input bg-card px-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const target = e.target as HTMLInputElement;
                              changeHours(member.id, Number(target.value));
                            }
                          }}
                        ></input>
                      </td>
                      <td className={tdClass + " text-right"}>
                        <button
                          disabled={isPending}
                          className="text-destructive hover:text-destructive/80 text-sm font-semibold disabled:opacity-50"
                          onClick={() => {
                            deleteMember(
                              member.id,
                              member.member_member.first_name +
                                " " +
                                member.member_member.last_name
                            );
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            </TableShell>
          </div>
          {showEditShiftPopup && (
            <Modal title="Edit Shift" onClose={() => setShowEditShiftPopup(false)}>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(editShift)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shift Description:</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              placeholder=""
                              disabled={isPending}
                              className="border rounded p-2 mb-4 w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shift Location:</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              placeholder=""
                              disabled={isPending}
                              className="border rounded p-2 mb-4 w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="spots"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Spots:</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder=""
                              disabled={isPending}
                              className="border rounded p-2 mb-4 w-full"
                              onChange={(value) =>
                                field.onChange(value.target.valueAsNumber)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="start_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time:</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="end_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time:</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {error && <FormError message={error} />}
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEditShiftPopup(false)}
                        disabled={isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isPending}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
            </Modal>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminShiftDetails;
