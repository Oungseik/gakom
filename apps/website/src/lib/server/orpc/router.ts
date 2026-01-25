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
import { getAttendanceHandler } from "./handlers/organizations/attendences/get";
import { listHandler } from "./handlers/organizations/attendences/list";
import { getStatsHandler as getAttendanceStatsHandler } from "./handlers/organizations/attendences/stats";
import { createOrganizationHandler } from "./handlers/organizations/create";
import { acceptInvitationHandler } from "./handlers/organizations/invitations/accept";
import { cancelInvitationHandler } from "./handlers/organizations/invitations/cancel";
import { listInvitationsHandler } from "./handlers/organizations/invitations/list";
import { sendInvitationHandler } from "./handlers/organizations/invitations/send";
import { createLeavePolicyHandler } from "./handlers/organizations/leave/create";
import { deleteLeavePolicyHandler } from "./handlers/organizations/leave/delete";
import { listLeavePoliciesHandler } from "./handlers/organizations/leave/list";
import { updateLeavePolicyHandler } from "./handlers/organizations/leave/update";
import { listLeaveBalancesHandler } from "./handlers/organizations/leaveBalances/list";
import { approveLeaveRequestHandler } from "./handlers/organizations/leaveRequests/approve";
import { cancelLeaveRequestHandler } from "./handlers/organizations/leaveRequests/cancel";
import { createLeaveRequestHandler } from "./handlers/organizations/leaveRequests/create";
import { listLeaveRequestsHandler } from "./handlers/organizations/leaveRequests/list";
import { rejectLeaveRequestHandler } from "./handlers/organizations/leaveRequests/reject";
import { getStatsHandler } from "./handlers/organizations/leaveRequests/stats";
import { listMembersHandler } from "./handlers/organizations/members/list";
import { removeMemberHandler } from "./handlers/organizations/members/remove";
import { getStatisticsHandler } from "./handlers/organizations/members/stats";
import { updateMemberHandler } from "./handlers/organizations/members/update";

export const router = os.router({
  health: { check: healthCheckHandler },
  images: {
    remove: removeImageHandler,
    upload: uploadImageHandler,
  },
  organizations: {
    create: createOrganizationHandler,

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
  },
});

/** only for server-side call */
export const client = createRouterClient(router);

export type Router = typeof router;
