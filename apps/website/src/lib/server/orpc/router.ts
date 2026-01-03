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
import { listInvitationsHandler } from "./handlers/organizations/invitations/list";
import { createLeaveHandler } from "./handlers/organizations/leave/create";
import { cancelLeaveRequestHandler } from "./handlers/organizations/leaveRequests/cancel";
import { listLeaveRequestsHandler } from "./handlers/organizations/leaveRequests/list";
import { listMembersHandler } from "./handlers/organizations/members/list";
import { removeMemberHandler } from "./handlers/organizations/members/remove";
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
    },
    invitations: { list: listInvitationsHandler },
    leaveRequests: {
      cancel: cancelLeaveRequestHandler,
      list: listLeaveRequestsHandler,
      stats: {},
    },
    leave: { create: createLeaveHandler },
  },
});

/** only for server-side call */
export const client = createRouterClient(router);

export type Router = typeof router;
