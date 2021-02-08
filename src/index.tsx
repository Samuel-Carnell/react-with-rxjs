import React from 'react';

interface Props {
	text: string;
}

export const ExampleComponent = ({ text }: Props) => {
	return <div className={styles.test}>Example Component: {text}</div>;
};
