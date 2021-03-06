var Navbar = require('../../app/components/navbar');
var testUser = {
  'userid': '11',
  'username': 'mary.smith@example.com',
  'emails': ['mary.smith@example.com'],
  'profile': {
    'fullName': 'Mary Smith',
    'patient': {
      'birthday': '1987-03-08',
      'diagnosisDate': '1994-02-01',
      'about': 'Loves swimming and fishing. Owns a bakery in San Francisco. Favorite color is orange.'
    }
  }
};

describe('Navbar', function() {
  var component;

  beforeEach(function() {
    component = helpers.mountComponent(Navbar({
      trackMetric: function() {}
    }));
  });

  afterEach(function() {
    helpers.unmountComponent();
  });

  it('should correctly display app version number', function() {
    var versionNumber = '0.0.0';
    var expectedVersion = 'v' + versionNumber;

    component.setProps({version: versionNumber});
    var renderedVersion = component.refs.version.props.children;

    expect(renderedVersion).to.equal(expectedVersion);
  });

  it('should not show user if none given', function() {
    component.setProps({user: null});
    var userNode = component.refs.user;

    expect(userNode).to.not.exist;
  });

  it('should show user if object given', function() {
    component.setProps({user: testUser});
    var userNode = component.refs.user;

    expect(userNode).to.exist;
  });

  it('should correctly display user full name', function() {
    var user = testUser;
    var expectedFullName = user.profile.fullName;

    component.setProps({user: user});
    var fullName = component.refs.userFullName.props.children;

    expect(fullName).to.equal(expectedFullName);
  });

  it('should call callback when logout clicked', function() {
    var user = testUser;
    var handleLogout = sinon.spy();

    component.setProps({
      user: user,
      onLogout: handleLogout
    });
    var clickLogout = component.refs.logout.props.onClick;
    clickLogout();

    expect(handleLogout).to.have.been.called;
  });
});
