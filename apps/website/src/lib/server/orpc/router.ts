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
import { listInvitationsHandler } from "./handlers/organizations/invitations/list";
import { listMembersHandler } from "./handlers/organizations/members/list";
import { updateMemberHandler } from "./handlers/organizations/members/update";

export const router = os.router({
  health: { check: healthCheckHandler },
  images: {
    remove: removeImageHandler,
    upload: uploadImageHandler,
  },
  organizations: {
    attendances: {},
    attendancesPolicies: {
      create: createAttendancePolicyHandler,
      count: countAttendancePoliciesHandler,
      get: getAttendancePolicyHandler,
      update: updateAttendancePolicyHandler,
      list: listAttendancePoliciesHandler,
      delete: deleteAttendancePolicyHandler,
    },
    members: { list: listMembersHandler, update: updateMemberHandler },
    invitations: { list: listInvitationsHandler },
  },
});

/** only for server-side call */
export const client = createRouterClient(router);

export type Router = typeof router;
