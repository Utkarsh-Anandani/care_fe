import careConfig from "@careConfig";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import AvatarEditModal from "@/components/Common/AvatarEditModal";
import AvatarEditable from "@/components/Common/AvatarEditable";

import { LocalStorageKeys } from "@/common/constants";

import * as Notification from "@/Utils/Notifications";
import routes from "@/Utils/request/api";
import query from "@/Utils/request/query";
import request from "@/Utils/request/request";
import uploadFile from "@/Utils/request/uploadFile";
import { sleep } from "@/Utils/utils";

interface CoverImageProps {
  facilityId: string;
}

export const CoverImage = ({ facilityId }: CoverImageProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [openUploadModal, setOpenUploadModal] = useState(false);

  const { data } = useQuery({
    queryKey: ["facility", facilityId],
    queryFn: query(routes.getPermittedFacility, {
      pathParams: { id: facilityId },
    }),
  });

  const refetchFacility = async () => {
    try {
      await queryClient.invalidateQueries({
        queryKey: ["facility", facilityId],
        refetchType: "active",
      });
    } catch (error) {
      Notification.Error({ msg: "Unable to fetch facility cover image" });
    }
  };

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
          refetchFacility();
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
      refetchFacility();
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
        imageUrl={data?.read_cover_image_url}
        handleUpload={handleCoverImageUpload}
        handleDelete={handleCoverImageDelete}
        onClose={() => setOpenUploadModal(false)}
      />
      <div>
        <AvatarEditable
          id="facility-coverimage"
          imageUrl={data?.read_cover_image_url}
          name={data?.name ? data.name : ""}
          editable={true}
          onClick={() => setOpenUploadModal(true)}
          className="md:mr-2 lg:mr-6 md:w-80 md:h-80 lg:h-100 lg:w-100"
        />
      </div>
    </div>
  );
};
