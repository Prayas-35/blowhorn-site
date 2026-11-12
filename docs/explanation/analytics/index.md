# What the analytics numbers mean


> Measured versus trended counts, what each tile counts, and how fresh the numbers are.


Analytics counts what the platforms showed, not what Blowhorn hoped.
Every number is either measured, read off the platform during
collection, or trended, appended to the profile's history so growth
reads across runs. Nothing is estimated and no reach is promised.

LinkedIn tiles count the page: total followers, new followers over 30
days, impressions, and reactions, each read from the page's own
analytics export during collection. LinkedIn collects for one profile
at a time; a run asked for all profiles says so and collects none for
LinkedIn. X and Bluesky append one follower and following trend activity
each per run instead of tiles: two counts and a timestamp, growing the
CSV history the report reads.

`blowhorn analytics` collects into the repository-root `data/analytics/`
directory and records the readings beside the exports, so a later
collection reads as change, not as a fresh claim. The exports also land
in the store on import - the daily series as well as the summary
readings - and `blowhorn report` builds `analytics_report.html` from
those stored rows, falling back to the exports on disk when the store
cannot answer; either way stale figures give a stale report and it says
which exports its figures came from. The analytics
screen states each number's freshness in its header for the same
reason: a count without a date is decoration.

A dry run prints the tile shapes with no values, proving the shape of
the read without touching a platform. Bluesky page-style tiles do not
exist: Bluesky gives the trend activity, and asking the tiles for more
would be inventing numbers the platform never showed.

An activity's result keeps the same line. Its delivery is measured: the
recorded promotion stamp and link, and the run that ended just after the
stamp, which names the computer and Chrome profile. Its reception is
measured too, read from the "All posts" sheet of the page's content export
and dated by that export. A post the export lists but no content activity links
to is kept and marked unmatched rather than dropped. The comparison to the
page median and the follower change around the activity are derived, and
labelled so: the follower change is the readings before and a week after,
which shows correlation, not cause. Where nothing was collected, the result
says so and why, instead of showing a zero.

## Related

- [Collect and read your analytics](/docs/how-to/measure/analytics/) - collect now, read the report.
- [The Blowhorn app, screen by screen](/docs/reference/use-the-desktop-app/) - the Performance screen.
- [Platforms](/docs/reference/platforms/) - which platforms collect what.
- [Preview and publish queued posts](/docs/how-to/publish/post-content/) - dry runs print shapes too.

