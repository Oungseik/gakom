import { createRouterClient } from "@orpc/server";

import { os } from "./base";
import { healthCheckHandler } from "./handlers/health/health_check";
import { removeImageHandler } from "./handlers/images/remove_image";
import { uploadImageHandler } from "./handlers/images/upload_image";
import { countAttendancePoliciesHandler } from "./handlers/organizations/attendancePolicies/count";
import { createAttendancePolicyHandler } from "./handlers/organizations/attendancePolicies/create";
import { deleteAttendancePolicyHandler } from "./handlers/organizations/attendancePolicies/delete";
import { getAttendancePolicyHandler } from "./handlers/organizations/attendancePolicies/get";
import { listAttendancePoliciesHandler } from "./handlers/organizations/attendancePolicies/list";
import { updateAttendancePolicyHandler } from "./handlers/organizations/attendancePolicies/update";
import { checkInHandler } from "./handlers/organizations/attendences/check_in";
import { checkOutHandler } from "./handlers/organizations/attendences/check_out";
import { listHandler } from "./handlers/organizations/attendences/list";
import { getStatsHandler as getAttendanceStatsHandler } from "./handlers/organizations/attendences/stats/get";
import { listInvitationsHandler } from "./handlers/organizations/invitations/list";
import { approveLeaveRequestHandler } from "./handlers/organizations/leaveRequests/approve";
import { cancelLeaveRequestHandler } from "./handlers/organizations/leaveRequests/cancel";
import { createLeaveRequestHandler } from "./handlers/organizations/leaveRequests/create";
import { listLeaveRequestsHandler } from "./handlers/organizations/leaveRequests/list";
import { rejectLeaveRequestHandler } from "./handlers/organizations/leaveRequests/reject";
import { getStatsHandler } from "./handlers/organizations/leaveRequests/stats/get";
import { listMembersHandler } from "./handlers/organizations/members/list";
import { removeMemberHandler } from "./handlers/organizations/members/remove";
import { getStatisticsHandler } from "./handlers/organizations/members/stats/get";
import { updateMemberHandler } from "./handlers/organizations/members/update";

export const router = os.router({
  health: { check: healthCheckHandler },
  images: {
    remove: removeImageHandler,
    upload: uploadImageHandler,
  },
  organizations: {
    attendances: {
      checkIn: checkInHandler,
      checkOut: checkOutHandler,
      list: listHandler,
      stats: { get: getAttendanceStatsHandler },
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
      stats: { get: getStatisticsHandler },
    },
    invitations: { list: listInvitationsHandler },
    leaveRequests: {
      list: listLeaveRequestsHandler,
      approve: approveLeaveRequestHandler,
      create: createLeaveRequestHandler,
      cancel: cancelLeaveRequestHandler,
      reject: rejectLeaveRequestHandler,
      stats: { get: getStatsHandler },
    },
  },
});

/** only for server-side call */
export const client = createRouterClient(router);

export type Router = typeof router;
