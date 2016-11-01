import {AboutPage} from './about.po';


describe('Pages: About', function () {

  let page: AboutPage;

  beforeEach(() => {
    page = new AboutPage();
  });

  it('should have the correct link to join', () => {
    page.navigateTo();
    expect(page.getJoinButton().getAttribute('href')).toEqual('http://www.leedsuniversityunion.org.uk/groups/skydiving/');
  });

  it('should have the correct affiliate links', () => {
    page.navigateTo();

    expect(page.getAffiliateLinks().get(0).getAttribute('href')).toEqual('http://www.flyaerodyne.com/');
    expect(page.getAffiliateLinks().get(1).getAttribute('href')).toEqual('http://www.bpa.org.uk/');
    expect(page.getAffiliateLinks().get(2).getAttribute('href')).toEqual('https://www.bcpa.org.uk/');
  });

  it('should highlight only the about button', () => {
    page.navigateTo();
    expect(page.getAboutLink().getCssValue('background-color')).toEqual('rgba(217, 244, 255, 1)');

    [
      page.getHomeLink(),
      page.getCommitteeLink(),
      page.getPricesLink(),
      page.getFaqLink(),
      page.getJoinLink(),
      page.getContactLink()
    ].forEach(page => expect(page.getCssValue('background-color')).toEqual('rgba(0, 0, 0, 0)'));
  });

});