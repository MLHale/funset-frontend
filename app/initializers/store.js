export function initialize(application) {
  application.inject('component', 'store', 'service:store');
}

export default {
  initialize
};
