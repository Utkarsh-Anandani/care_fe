import careConfig from "@careConfig";
import { navigate } from "raviger";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { LocalStorageKeys } from "@/common/constants";

import * as Notification from "@/Utils/Notifications";
import routes from "@/Utils/request/api";
import request from "@/Utils/request/request";
import uploadFile from "@/Utils/request/uploadFile";
import useTanStackQueryInstead from "@/Utils/request/useQuery";
import { sleep } from "@/Utils/utils";

import AvatarEditModal from "../Common/AvatarEditModal";
import AvatarEditable from "../Common/AvatarEditable";

interface CoverImageProps {
  facilityId: string;
}

export const CoverImage = ({ facilityId }: CoverImageProps) => {
  const { t } = useTranslation();

  const [openUploadModal, setOpenUploadModal] = useState(false);

  const { data: facilityData, refetch: facilityFetch } =
    useTanStackQueryInstead(routes.getPermittedFacility, {
      pathParams: {
        id: facilityId,
      },
      onResponse: ({ res }) => {
        if (!res?.ok) {
          navigate("/not-found");
        }
      },
    });

  const handleCoverImageUpload = async (file: File, onError: () => void) => {
    const formData = new FormData();
    formData.append("cover_image", file);
    const url = `${careConfig.apiUrl}/api/v1/facility/${facilityId}/cover_image/`;

    uploadFile(
      url,
      formData,
      "POST",
      {
        Authorization:
          "Bearer " + localStorage.getItem(LocalStorageKeys.accessToken),
      },
      async (xhr: XMLHttpRequest) => {
        if (xhr.status === 200) {
          await sleep(1000);
          facilityFetch();
          Notification.Success({ msg: "Cover image updated." });
          setOpenUploadModal(false);
        } else {
          onError();
        }
      },
      null,
      () => {
        onError();
      },
    );
  };

  const handleCoverImageDelete = async (onError: () => void) => {
    const { res } = await request(routes.deleteFacilityCoverImage, {
      pathParams: { id: facilityId },
    });
    if (res?.ok) {
      Notification.Success({ msg: "Cover image deleted" });
      facilityFetch();
      setOpenUploadModal(false);
    } else {
      onError();
    }
  };

  return (
    <div className="my-auto mx-auto flex">
      <AvatarEditModal
        title={t("edit_cover_photo")}
        open={openUploadModal}
        imageUrl={facilityData?.read_cover_image_url}
        handleUpload={handleCoverImageUpload}
        handleDelete={handleCoverImageDelete}
        onClose={() => setOpenUploadModal(false)}
      />
      <div>
        <AvatarEditable
          id="facility-coverimage"
          imageUrl={facilityData?.read_cover_image_url}
          name={facilityData?.name ? facilityData.name : ""}
          editable={true}
          onClick={() => setOpenUploadModal(true)}
          className="md:mr-2 lg:mr-6 md:w-80 md:h-80 lg:h-100 lg:w-100"
        />
      </div>
    </div>
  );
};
