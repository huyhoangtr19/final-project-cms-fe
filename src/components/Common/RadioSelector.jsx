const RadioSelector = ({ 
  title, 
  subtitle, 
  active,
  onClick
}) => {
  const activeClassName = active ? " active" : "";

  return (
    <div 
      className={"radio-selector-container" + activeClassName}
      onClick={onClick}
    >
      <div className="infos">
        <h5 className={"title" + (subtitle ? "" : " mb-0")}>{title}</h5>
        {subtitle && (<p className="subtitle">{subtitle}</p>)}
      </div>
      <div className="checkbox-container">
        <div className={"checkbox" + activeClassName}>
          <i className={"icon fa fa-check" + activeClassName} />
        </div>
      </div>
    </div>
  )
}

export default RadioSelector;