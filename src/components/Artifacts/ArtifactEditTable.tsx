import ArtifactForm from "./ArtifactForm";

import type { IArtifact } from "models";
import { deleteArtifacts } from "redux/artifactsSlice";

import React, { useState } from "react";
import { Pencil, Trash } from "react-bootstrap-icons";
import { useDispatch } from "react-redux";
import { Button } from "react-bootstrap";

interface IArtifactEditTableProps {
  artifact: IArtifact;
}

const ArtifactEditTable = (props: IArtifactEditTableProps): JSX.Element => {
  const { artifact } = props;
  const { Guid } = artifact;

  const [show, setShow] = useState(false);
  const dispatch = useDispatch();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const dispatchDeleteArtifact = () => {
    dispatch(deleteArtifacts({ id: Guid }));
  };

  return (
    <>
      <Button variant="success" size="sm" onClick={handleShow}>
        <Pencil />
      </Button>
      <Button variant="danger" size="sm" onClick={dispatchDeleteArtifact}>
        <Trash />
      </Button>
      <ArtifactForm artifact={artifact} handleClose={handleClose} show={show} />
    </>
  );
};

export default ArtifactEditTable;
