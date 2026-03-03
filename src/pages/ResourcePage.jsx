import React from 'react';
import IjamOSWorkspace from '../features/ijam-os/IjamOSWorkspace';

const ResourcePage = ({ session, currentUser, isMobileView, deviceMode = 'desktop', ijamOsMode = 'mac_desktop', setPublicPage }) => {
  return (
    <IjamOSWorkspace
      session={session}
      currentUser={currentUser}
      isMobileView={isMobileView}
      deviceMode={deviceMode}
      ijamOsMode={ijamOsMode}
      setPublicPage={setPublicPage}
    />
  );
};

export default ResourcePage;

