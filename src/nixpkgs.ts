import { err, type IProvider, ok, type Result, USER_AGENT } from "./utils";

const URL = "https://prometheus.nixos.org/api/v1/query?query=channel_revision";
const STATUSES = ["stable", "rolling"] as const;
const VARIANTS = ["primary", "darwin", "small"] as const;

type Status = (typeof STATUSES)[number];
type Variant = (typeof VARIANTS)[number];

function isStatus(str: string): str is Status {
  return STATUSES.includes(str as Status);
}

function isVariant(str: string): str is Variant {
  return VARIANTS.includes(str as Variant);
}

// TODO: zod validation?
type ChannelResponse = {
  status: string;
  data: {
    result: {
      metric: {
        channel: string;
        current: "0" | "1";
        status: Status;
        variant?: Variant;
      };
    }[];
  };
};

export interface Parameters {
  status: Status;
  variant: Variant;
}

export class NixpkgsProvider implements IProvider<"nixpkgs", Parameters> {
  match(str: string): str is "nixpkgs" {
    return str === "nixpkgs";
  }

  parse(_name: "nixpkgs", args: string[]): Result<Parameters, string> {
    let status: Status = "stable";
    let variant: Variant = "primary";

    if (args.length > 2) {
      return err(`must have at most 2 arguments, instead got ${args.length}`);
    }

    const firstParameter = args.at(0);
    const secondParameter = args.at(1);

    if (firstParameter) {
      if (isStatus(firstParameter)) {
        status = firstParameter;
        if (secondParameter) {
          if (!isVariant(secondParameter)) return err(`invalid variant '${secondParameter}'`);
          variant = secondParameter;
        } else {
          variant = "primary";
        }
      } else if (isVariant(firstParameter)) {
        variant = firstParameter;
        if (secondParameter) {
          if (!isStatus(secondParameter)) return err(`invalid status '${secondParameter}'`);
          status = secondParameter;
        } else {
          status = "stable";
        }
      } else {
        return err(`parameter '${firstParameter}' is neither a status nor variant`);
      }
    }

    return ok({ status, variant });
  }

  async handle(_request: Request, { status, variant }: Parameters): Promise<Response> {
    const resp = (await fetch(URL, { headers: { "User-Agent": USER_AGENT } }).then((r) => r.json())) as ChannelResponse;
    const channels = resp.data.result;

    if (resp.status !== "success") {
      console.error(resp);
      return Response.json("error: bad response from nixpkgs", { status: 503 });
    }

    const channel = channels.find(
      (ch) =>
        ch.metric.status === status &&
        // The `nixpkgs-unstable` channel has no variant so default it to darwin.
        (ch.metric.variant || "darwin") === variant &&
        ch.metric.current === "1",
    );

    if (!channel) {
      return Response.json("error: channel not found", { status: 404 });
    }

    return new Response(null, {
      status: 307,
      headers: {
        Location: `https://channels.nixos.org/${channel.metric.channel}/nixexprs.tar.xz`,
        // leave out Link rel=immutable because channels.nixos.org does its own locking
        "Cache-Control": "max-age=86400",
      },
    });
  }
}

export default new NixpkgsProvider();
