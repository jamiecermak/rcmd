/* eslint-disable @typescript-eslint/ban-types */
import type { GetServerSidePropsContext } from "next";
import type { AuthGuard } from "./core/auth-guard";
import type { TeamMemberAssertionOptions } from "./core/teams/team-member-policy";
import { getAuth } from "@clerk/nextjs/server";

export class NextJSPageAuth {
  constructor(private authGuard: AuthGuard) {}

  async authoriseTeamViaServerContext(
    context: GetServerSidePropsContext,
    opts: TeamMemberAssertionOptions = {}
  ) {
    if (
      !context.params ||
      !context.params.team_id ||
      Array.isArray(context.params.team_id)
    )
      return { notFound: true };

    const teamId = context.params.team_id;

    try {
      const auth = getAuth(context.req);
      const userId = auth.userId ?? null;

      const { team, user, teamMemberPolicy } =
        await this.authGuard.authoriseByTeamMember(userId, teamId, opts);

      return {
        props: {
          team: {
            id: team.id,
            name: team.name,
            description: team.description,
          },
          user: {
            id: user.id,
          },
          membership: {
            isAdmin: teamMemberPolicy.isAdmin(user.id),
            isOwner: teamMemberPolicy.isOwner(user.id),
          },
        },
      };
    } catch (ex) {
      return {
        notFound: true,
      };
    }
  }
}
