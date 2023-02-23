const Show: React.FC<{
  when: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = props => {
  return <>{props.when ? props.children : props.fallback ?? null}</>;
};

export default Show;
