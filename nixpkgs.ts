const URL = "https://prometheus.nixos.org/api/v1/query?query=channel_revision";

export const REGEX = new RegExp(`^(?:\\/(\\w*)(?:\\/(\\w*))?)?$`);

const STATUSES = [
  "stable",
  "rolling",
] as const;

const VARIANTS = [
  "primary",
  "darwin",
  "small",
] as const;

type Status = typeof STATUSES[number];
type Variant = typeof VARIANTS[number];

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

export async function getVersions(path: string): Promise<Response> {
  const match = REGEX.exec(path);
  if (!match) {
    return Response.json({ error: "regex_match_fail" }, { status: 400 });
  }

  let status: Status;
  let variant: Variant;

  const firstParameter = match.at(1);
  const secondParameter = match.at(2);

  if (STATUSES.includes(firstParameter as Status)) {
    status = firstParameter as Status;
  } else if (STATUSES.includes(secondParameter as Status)) {
    status = secondParameter as Status;
  } else if (!firstParameter || !secondParameter) {
    status = STATUSES[0];
  } else {
    return Response.json({ error: "invalid_parameters" }, { status: 400 });
  }

  if (VARIANTS.includes(firstParameter as Variant)) {
    variant = firstParameter as Variant;
  } else if (VARIANTS.includes(secondParameter as Variant)) {
    variant = secondParameter as Variant;
  } else if (!firstParameter || !secondParameter) {
    variant = VARIANTS[0];
  } else {
    return Response.json({ error: "invalid_parameters" }, { status: 400 });
  }

  const resp: ChannelResponse = await fetch(URL).then((r) => r.json());
  const channels = resp.data.result;

  if (resp.status !== "success") {
    return Response.json({ error: "bad_response", data: resp }, {
      status: 503,
    });
  }

  const channel = channels.find((ch) =>
    ch.metric.status === status &&
    // The `nixpkgs-unstable` channel has no variant so default it to darwin.
    (ch.metric.variant || "darwin") === variant &&
    ch.metric.current === "1"
  );

  if (!channel) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  return new Response(null, {
    status: 307,
    headers: {
      "Location": `https://channels.nixos.org/${channel.metric.channel}/nixexprs.tar.xz`,
      "Cache-Control": "max-age=300",
    },
  });
}
