export function bindProps(node: HTMLElement, props: Record<string, unknown>) {
	let current = props;

	const apply = () => {
		for (const [key, value] of Object.entries(current)) {
			(node as unknown as Record<string, unknown>)[key] = value;
		}
	};

	apply();

	if (node.localName.includes('-') && !customElements.get(node.localName)) {
		customElements.whenDefined(node.localName).then(apply);
	}

	return {
		update(next: Record<string, unknown>) {
			current = next;
			apply();
		}
	};
}
