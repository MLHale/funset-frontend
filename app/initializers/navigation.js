export function initialize(application) {
  application.inject('component', 'navigation', 'service:navigation');
  application.inject('controller', 'navigation', 'service:navigation');
  application.inject('route', 'navigation', 'service:navigation');
}

export default {
  initialize
};
