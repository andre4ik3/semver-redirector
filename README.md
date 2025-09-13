# Flake SemVer Redirector

Parses semantic version ranges in URLs and redirects them to matched tags in a
GitHub/Gitea/Forgejo repository.

When enumerating the repo's tags, any tags that don't conform to semantic
versioning will be skipped. If no version is matched, a list of these tags is
returned in the error.

The special case `latest` causes all semantic version parsing to be skipped and
just returns the latest tag, making it possible to get the latest tag of flakes
that don't conform to semantic versioning.
