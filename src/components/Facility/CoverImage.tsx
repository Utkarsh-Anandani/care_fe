import careConfig from "@careConfig";
import { navigate } from "raviger";
import { SetStateAction } from "react";
import { useTranslation } from "react-i18next";

import useAppHistory from "@/hooks/useAppHistory";

import { LocalStorageKeys } from "@/common/constants";

import * as Notification from "@/Utils/Notifications";
import routes from "@/Utils/request/api";
import request from "@/Utils/request/request";
import uploadFile from "@/Utils/request/uploadFile";
import useTanStackQueryInstead from "@/Utils/request/useQuery";
import { sleep } from "@/Utils/utils";

import AvatarEditModal from "../Common/AvatarEditModal";
import AvatarEditable from "../Common/AvatarEditable";
import { Cancel, Submit } from "../Common/ButtonV2";

type uploadCoverImageType = React.Dispatch<SetStateAction<boolean>>;
type setCurrentStepType = React.Dispatch<SetStateAction<number>>;

interface CoverImageProps {
  uploadCoverImage: boolean;
  setUploadCoverImage: uploadCoverImageType;
  createdFacilityId: string;
  currentStep: number;
  setCurrentStep: setCurrentStepType;
}

export const CoverImage = ({
  uploadCoverImage,
  setUploadCoverImage,
  createdFacilityId,
  currentStep,
  setCurrentStep,
}: CoverImageProps) => {
  const { t } = useTranslation();
  const { goBack } = useAppHistory();

  const { data: facilityData, refetch: facilityFetch } =
    useTanStackQueryInstead(routes.getPermittedFacility, {
      pathParams: {
        id: createdFacilityId,
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
    const url = `${careConfig.apiUrl}/api/v1/facility/${createdFacilityId}/cover_image/`;

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
          setUploadCoverImage(false);
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
      pathParams: { id: createdFacilityId },
    });
    if (res?.ok) {
      Notification.Success({ msg: "Cover image deleted" });
      facilityFetch();
      setUploadCoverImage(false);
    } else {
      onError();
    }
  };

  return (
    <div className="w-full h-full my-auto flex justify-center items-center">
      <AvatarEditModal
        title={t("edit_cover_photo")}
        open={uploadCoverImage}
        imageUrl={facilityData?.read_cover_image_url}
        handleUpload={handleCoverImageUpload}
        handleDelete={handleCoverImageDelete}
        onClose={() => setUploadCoverImage(false)}
      />
      <div className="flex flex-col md:flex-row gap-5 relative">
        <AvatarEditable
          id="facility-coverimage"
          imageUrl={facilityData?.read_cover_image_url}
          name={facilityData?.name ? facilityData.name : ""}
          editable={true}
          onClick={() => setUploadCoverImage(true)}
          className="md:mr-2 lg:mr-6 lg:h-80 lg:w-80"
        />
        <div className="w-full h-full">
          <h3>Hover the existing cover image to upload a new cover image</h3>
          <h5>Guidelines for cover image selection</h5>
          <ul className="list-disc pl-6 text-sm text-color-body-dark">
            <li>Max size for image uploaded should be 1mb</li>
            <li>Allowed formats are jpg,png,jpeg</li>
            <li>Recommended aspect ratio for the image is 1:1</li>
          </ul>
          <div className="mt-20 flex flex-col-reverse justify-end gap-3 sm:flex-row md:absolute md:right-0 md:bottom-5">
            <Cancel onClick={() => goBack()} />
            <Submit
              type="button"
              onClick={() => {
                setCurrentStep(currentStep + 1);
              }}
              label={"Update Cover Image"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
