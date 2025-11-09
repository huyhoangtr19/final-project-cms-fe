import React, { useEffect } from "react";
import i18n from "../../i18n";

const SegmentTreeItem = React.memo(({ segment, selectedSegments, handleCheckboxChange, canDelete, openSegmentDetail, setDeleteId, setIsOpen }) => {
  return (
    <li key={segment.id} className="tree-list-item">
      <div className={"d-flex flex-row gap-2 justify-content-between " + (!segment.upper_id ? "tree-item" : "tree-item")}>
        <div className="d-flex flex-row gap-2 align-items-center">
          <input
            type="checkbox"
            checked={selectedSegments.includes(Number(segment.id))}
            onChange={() => handleCheckboxChange(segment.id)}
          />
          <div>{segment.name}</div>
        </div>
        {canDelete && (
          <div className="d-flex flex-row gap-2">
            <button
              className="btn btn-sm btn-delete-outline"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
                setDeleteId(segment.id);
              }}
            >
              {i18n.t("delete")}
            </button>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => openSegmentDetail(segment)}
            >
              {i18n.t("update")}
            </button>
          </div>
        )}
      </div>
      {segment.children.length > 0 && (
        <ul>
          {segment.children.map((child) => (
            <SegmentTreeItem
              key={child.id}
              segment={child}
              selectedSegments={selectedSegments}
              handleCheckboxChange={handleCheckboxChange}
              canDelete={canDelete}
              openSegmentDetail={openSegmentDetail}
              setDeleteId={setDeleteId}
              setIsOpen={setIsOpen}
            />
          ))}
        </ul>
      )}
    </li>
  );
});

const SegmentTree = React.memo(({ segments, selectedSegments, handleCheckboxChange, canDelete, openSegmentDetail, setDeleteId, setIsOpen }) => {
  return (
    <ul className="tree">
      {segments.map((segment) => (
        <SegmentTreeItem
          key={segment.id}
          segment={segment}
          selectedSegments={selectedSegments}
          handleCheckboxChange={handleCheckboxChange}
          canDelete={canDelete}
          openSegmentDetail={openSegmentDetail}
          setDeleteId={setDeleteId}
          setIsOpen={setIsOpen}

        />
      ))}
    </ul>
  );
});

export default SegmentTree;