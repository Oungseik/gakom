import { createRouterClient } from "@orpc/server";

import { os } from "./base";
import { countAttendancePoliciesHandler } from "./handlers/attendancePolicies/count";
import { createAttendancePolicyHandler } from "./handlers/attendancePolicies/create";
import { deleteAttendancePolicyHandler } from "./handlers/attendancePolicies/delete";
import { getAttendancePolicyHandler } from "./handlers/attendancePolicies/get";
import { listAttendancePoliciesHandler } from "./handlers/attendancePolicies/list";
import { updateAttendancePolicyHandler } from "./handlers/attendancePolicies/update";
import { checkInHandler } from "./handlers/attendances/check_in";
import { checkOutHandler } from "./handlers/attendances/check_out";
import { getAttendanceHandler } from "./handlers/attendances/get";
import { listHandler } from "./handlers/attendances/list";
import { getStatsHandler as getAttendanceStatsHandler } from "./handlers/attendances/stats";
import { createCalendarEventsHandler } from "./handlers/calendarEvents/create";
import { deleteCalendarEventHandler } from "./handlers/calendarEvents/delete";
import { getCalendarEventHandler } from "./handlers/calendarEvents/get";
import { listCalendarEventsHandler } from "./handlers/calendarEvents/list";
import { updateCalendarEventHandler } from "./handlers/calendarEvents/update";
import { createCalendarHandler } from "./handlers/calendars/create";
import { deleteCalendarHandler } from "./handlers/calendars/delete";
import { getCalendarHandler } from "./handlers/calendars/get";
import { listCalendarsHandler } from "./handlers/calendars/list";
import { setDefaultCalendarHandler } from "./handlers/calendars/setDefault";
import { updateCalendarHandler } from "./handlers/calendars/update";
import { healthCheckHandler } from "./handlers/health/health_check";
import { removeImageHandler } from "./handlers/images/remove_image";
import { uploadImageHandler } from "./handlers/images/upload_image";
import { acceptInvitationHandler } from "./handlers/invitations/accept";
import { cancelInvitationHandler } from "./handlers/invitations/cancel";
import { listInvitationsHandler } from "./handlers/invitations/list";
import { sendInvitationHandler } from "./handlers/invitations/send";
import { createLeavePolicyHandler } from "./handlers/leave/create";
import { deleteLeavePolicyHandler } from "./handlers/leave/delete";
import { listLeavePoliciesHandler } from "./handlers/leave/list";
import { updateLeavePolicyHandler } from "./handlers/leave/update";
import { listLeaveBalancesHandler } from "./handlers/leaveBalances/list";
import { approveLeaveRequestHandler } from "./handlers/leaveRequests/approve";
import { cancelLeaveRequestHandler } from "./handlers/leaveRequests/cancel";
import { createLeaveRequestHandler } from "./handlers/leaveRequests/create";
import { listLeaveRequestsHandler } from "./handlers/leaveRequests/list";
import { rejectLeaveRequestHandler } from "./handlers/leaveRequests/reject";
import { getStatsHandler } from "./handlers/leaveRequests/stats";
import { listMembersHandler } from "./handlers/members/list";
import { removeMemberHandler } from "./handlers/members/remove";
import { getStatisticsHandler } from "./handlers/members/stats";
import { updateMemberHandler } from "./handlers/members/update";
import { createOrganizationHandler } from "./handlers/organizations/create";

export const router = os.router({
  health: { check: healthCheckHandler },
  calendars: {
    list: listCalendarsHandler,
    get: getCalendarHandler,
    create: createCalendarHandler,
    update: updateCalendarHandler,
    delete: deleteCalendarHandler,
    setDefault: setDefaultCalendarHandler,
  },
  calendarEvents: {
    list: listCalendarEventsHandler,
    get: getCalendarEventHandler,
    create: createCalendarEventsHandler,
    update: updateCalendarEventHandler,
    delete: deleteCalendarEventHandler,
  },
  images: {
    remove: removeImageHandler,
    upload: uploadImageHandler,
  },
  attendances: {
    checkIn: checkInHandler,
    checkOut: checkOutHandler,
    list: listHandler,
    stats: getAttendanceStatsHandler,
    get: getAttendanceHandler,
  },
  attendancesPolicies: {
    create: createAttendancePolicyHandler,
    count: countAttendancePoliciesHandler,
    get: getAttendancePolicyHandler,
    update: updateAttendancePolicyHandler,
    list: listAttendancePoliciesHandler,
    delete: deleteAttendancePolicyHandler,
  },
  members: {
    list: listMembersHandler,
    update: updateMemberHandler,
    remove: removeMemberHandler,
    stats: getStatisticsHandler,
  },
  invitations: {
    list: listInvitationsHandler,
    send: sendInvitationHandler,
    accept: acceptInvitationHandler,
    cancel: cancelInvitationHandler,
  },
  leave: {
    create: createLeavePolicyHandler,
    list: listLeavePoliciesHandler,
    update: updateLeavePolicyHandler,
    delete: deleteLeavePolicyHandler,
  },
  leaveBalances: {
    list: listLeaveBalancesHandler,
  },
  leaveRequests: {
    list: listLeaveRequestsHandler,
    approve: approveLeaveRequestHandler,
    create: createLeaveRequestHandler,
    cancel: cancelLeaveRequestHandler,
    reject: rejectLeaveRequestHandler,
    stats: getStatsHandler,
  },
  organizations: {
    create: createOrganizationHandler,
  },
});

/** only for server-side call */
export const client = createRouterClient(router);

export type Router = typeof router;
