import { useEffect, useState, useMemo, useCallback } from "react";
import { Button } from "reactstrap";
import i18n from "i18next";
import { toast } from "react-toastify";
import MyModalTemplate from "../../../components/Common/MyModalTemplate";
import marketSegmentService from "../../../services/market.segment.service";
import { useAppSelector } from "../../../hook/store.hook";
import withRouter from "../../../components/Common/withRouter";
import ModalMarketSegment from "./ModalMarketSegment";
import TreeComponent from "../TreeComponent";

const MarketSegment = (props) => {
  // document.title = "Market Segment | Fitness CMS";

  const { permissionUser } = useAppSelector((state) => state.auth);

  const [segments, setSegments] = useState([]);
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenSegmentModal, setIsOpenSegmentModal] = useState(false);
  const [segmentInfo, setSegmentInfo] = useState(null);
  const [type, setType] = useState('create');

  const canAdd = useMemo(() => permissionUser.includes("market_segment:create"), [permissionUser]);
  const canDelete = useMemo(() => permissionUser.includes("market_segment:delete"), [permissionUser]);
  const isAllChecked = useMemo(() => segments.length > 0 && segments.length === selectedSegments.length, [segments, selectedSegments]);
  const treeData = useMemo(() => buildSegmentTree(segments), [segments]);

  const handleGetSegments = async () => {
    try {
      const res = await marketSegmentService.getListMarketSegments({});
      if (res.success) {
        setSegments(res.data);
      } else {
        toast.error("Error fetching data", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        })
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteSegment = async (id) => {
    try {
      const res = await marketSegmentService.deleteMarketSegment(id);
      if (res.success) {
        toast.success("Deleted successfully", {
          position: "top-right",
          autoClose: 200,
          theme: "light",
          hideProgressBar: true,
        });
        handleGetSegments();
      }
    } catch (err) {
      console.log("err", err);
      toast.error("Delete failed", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        hideProgressBar: true,
      });
    }
    setDeleteId(null);
  };

  const handleDeleteMultiple = async () => {
    try {
      const res = await marketSegmentService.deleteMultiMarketSegment(selectedSegments);
      if (res.success) {
        toast.success("Deleted selected segments", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
          hideProgressBar: true,
        });
        setSelectedSegments([]);
        handleGetSegments();
      }
    } catch (err) {
      console.log("error:", err);
      toast.error("Batch delete failed", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        hideProgressBar: true,
      });
    }
  };

  const handleDeleteModal = () => {
    if (deleteId) {
      handleDeleteSegment(deleteId);
    } else {
      handleDeleteMultiple();
    }
    setIsOpen(false);
  };

  const handleCheckboxChange = useCallback((id) => {
    setSelectedSegments((prev) =>
      prev.includes(Number(id))
        ? prev.filter((sid) => sid !== Number(id))
        : [...prev, Number(id)]
    );
  }, []);

  const openSegmentDetail = useCallback((segment) => {
    setSegmentInfo(segment);
    setType(segment === null ? 'create' : 'update');
    setIsOpenSegmentModal(true);
  }, []);

  const handleSetDeleteId = useCallback((id) => {
    setDeleteId(id);
  }, []);

  const handleSetIsOpen = useCallback((isOpen) => {
    setIsOpen(isOpen);
  }, []);

  const titleModal = useMemo(() => {
    return deleteId
      ? "Are you sure you want to delete this segment?"
      : "Are you sure you want to delete selected segments?";
  }, [deleteId]);

  function buildSegmentTree(segments) {
    const map = new Map();
    const tree = [];

    segments.forEach((seg) => {
      map.set(seg.id, { ...seg, children: [] });
    });

    segments.forEach((seg) => {
      if (seg.upper_id) {
        const parent = map.get(seg.upper_id);
        if (parent) parent.children.push(map.get(seg.id));
      } else {
        tree.push(map.get(seg.id));
      }
    });
    const sortedTree = tree.sort((a, b) => (a.id - b.id));
    return sortedTree;
  }

  useEffect(() => {
    if (!isOpenSegmentModal)
      handleGetSegments();
  }, [isOpenSegmentModal]);

  return (
    <div>
      <div className="action-buttons">
        <h5 className="mb-0 d-flex"
          style={{ alignItems: "center" }}
        >
          {segments.length <= 1 ? i18n.t("market_segment") : i18n.t("market_segments")}
        </h5>
        <div className="action-buttons mb-1">
          {canAdd && (
            <Button color="primary"
              onClick={() => openSegmentDetail(null)}
            >
              {i18n.t("add_market_segment")}
            </Button>
          )}
          {canDelete && (
            <Button
              color="danger"
              outline
              disabled={selectedSegments.length === 0}
              onClick={() => setIsOpen(true)}
            >
              {i18n.t("delete_selected")}
            </Button>
          )}
        </div>
      </div>
      <div className="mt-4"></div>

      {segments.length > 0 ? (
        <div className="tree-scroller">
          <div className="tree-container">
            <TreeComponent
              items={treeData}
              selectedItems={selectedSegments}
              handleCheckboxChange={handleCheckboxChange}
              canDelete={canDelete}
              openItemDetail={openSegmentDetail}
              setDeleteId={handleSetDeleteId}
              setIsOpen={handleSetIsOpen}
            />
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          {i18n.t("there_are_no_data_exist")}
        </div>
      )}

      <ModalMarketSegment
        type={type}
        isOpen={isOpenSegmentModal}
        onClose={() => setIsOpenSegmentModal(false)}
        segmentInfo={segmentInfo}
        onRefresh={() => { }}
        marketSegments={segments}
      />

      <MyModalTemplate
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size={"sm"}
      >
        <div className="d-flex flex-column gap-3">
          <div>{titleModal}</div>
          <div
            className="d-flex flex-row justify-content-center"
            style={{ gap: 50 }}
          >
            <Button color="secondary"
              outline
              onClick={() => {
                setIsOpen(false)
                setDeleteId("");
              }}>
              {i18n.t("cancel")}
            </Button>
            <button
              className="btn btn-primary btn-block d-flex gap-1"
              onClick={handleDeleteModal}
            >
              <div className="">{i18n.t("delete")}</div>
            </button>
          </div>
        </div>
      </MyModalTemplate>
    </div>
  );
};

export default withRouter(MarketSegment);
