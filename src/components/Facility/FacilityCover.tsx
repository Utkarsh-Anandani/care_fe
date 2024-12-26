import { navigate } from "raviger";
import { useEffect } from "react";

import useAuthUser from "@/hooks/useAuthUser";

import * as Notification from "@/Utils/Notifications";

import { Cancel, Submit } from "../Common/ButtonV2";
import Page from "../Common/Page";
import { CoverImage } from "./CoverImage";

interface FacilityProps {
  facilityId?: string;
}

export const FacilityCover = (props: FacilityProps) => {
  const { facilityId } = props;

  const authUser = useAuthUser();
  useEffect(() => {
    if (
      authUser &&
      authUser.user_type !== "StateAdmin" &&
      authUser.user_type !== "DistrictAdmin" &&
      authUser.user_type !== "DistrictLabAdmin"
    ) {
      navigate("/facility");
      Notification.Error({
        msg: "You don't have permission to perform this action. Contact the admin",
      });
    }
  }, [authUser]);

  return (
    <Page
      title="Cover Image"
      className="h-[90vh]"
      crumbsReplacements={{
        [facilityId || "????"]: { name: "Upload" },
      }}
    >
      <div className="md:pt-[10vh] md:pr-[5vw] pt-[5vh]">
        <div className="flex flex-col md:flex-row gap-5 relative">
          <CoverImage facilityId={facilityId ? facilityId : ""} />
          <div className="w-full h-full sm:px-[10vh] md:px-0">
            <p className="text-2xl font-extrabold mb-3">
              Hover the default cover image to upload a new cover image for your
              facility
            </p>
            <h5>Guidelines for cover image selection</h5>
            <ul className="list-disc pl-6 text-sm text-color-body-dark">
              <li>Max size for image uploaded should be 1mb</li>
              <li>Allowed formats are jpg,png,jpeg</li>
              <li>Recommended aspect ratio for the image is 1:1</li>
            </ul>
            <div className="mt-20 flex flex-col-reverse justify-end gap-3 sm:flex-row md:absolute md:right-0 md:bottom-5">
              <Cancel
                onClick={() => {
                  navigate(`/facility/${facilityId}`);
                }}
              />
              <Submit
                type="button"
                onClick={() => {
                  navigate(`/facility/${facilityId}`);
                }}
                label={"Update Cover Image"}
              />
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};
