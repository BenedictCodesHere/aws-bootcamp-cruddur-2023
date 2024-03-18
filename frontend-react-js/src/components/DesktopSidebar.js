import './DesktopSidebar.css';
import Search from '../components/Search';
import TrendingSection from '../components/TrendingsSection'
import SuggestedUsersSection from '../components/SuggestedUsersSection'
import JoinSection from '../components/JoinSection'

export default function DesktopSidebar(props) {
  const trendings = [
    {"hashtag": "CloudArchitect", "count": 2012 },
    {"hashtag": "FullStackDev", "count": 1119 },
    {"hashtag": "AWS", "count": 8903 },
    {"hashtag": "SolutionsArchitect", "count": 4053 }
  ]

  const users = [
    {"display_name": "Benedict McElroy", "handle": "BenedictCodesHere"}
  ]

  // Good example of conditional rendering for logged in/logged out state
  let search;
  let trending;
  let suggested;
  let join;
  if (props.user) {
    search = <Search />
    trending = <TrendingSection trendings={trendings} />
    suggested = <SuggestedUsersSection users={users} />
  } else {
    join = <JoinSection />
  }

  return (
    <section>
      {search}
      {trending}
      {suggested}
      {join}
      <footer>
        <a href="/about">About</a>
        <a href="/terms">Terms of Service</a>
        <a href="/privacy">Privacy Policy</a>
      </footer>
    </section>
  );
}