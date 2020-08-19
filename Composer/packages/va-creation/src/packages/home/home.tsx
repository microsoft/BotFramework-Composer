import * as React from 'react';

interface HomeProps {}

export class Home extends React.Component<HomeProps, any> {
  constructor(props: HomeProps) {
    super(props);
  }

  public render() {
    return (
      <iframe
        style={{ width: '100%', height: '92vh' }}
        src="https://msit.powerbi.com/reportEmbed?reportId=e4355e61-2183-4582-a66c-841e3b60eb32&autoAuth=true&ctid=72f988bf-86f1-41af-91ab-2d7cd011db47&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9kZi1tc2l0LXNjdXMtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQvIn0%3D"
        frameBorder="0"
        allowFullScreen={true}
      ></iframe>
    );
  }
}
