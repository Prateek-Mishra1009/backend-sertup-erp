import { Schema, model } from "mongoose";
import { createSlug, unixTime } from "../helpers/helper";

const cmsSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

cmsSchema.method("getCmsDetail", async function getCmsDetail() {
  return {
    _id: this._id,
    title: this.title,
    slug: this.slug,
    description: this.description,
    createdBy: this.createdBy,
    updatedBy: this.updatedBy,
    deletedBy: this.deletedBy,
    createdAt: await unixTime(this.createdAt),
    updatedAt: await unixTime(this.updatedAt),
  };
});

const CMS = model("cms", cmsSchema);

const pages = [
  {
    title: "Terms & Condition",
    description: `
        <h2 style="text-align:center;"><strong>Terms of Service</strong></h2><h4>How is Lorem Ipsum?</h4><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.</p><h4>Lorem ipsum</h4><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but alsthe leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p><h4>Lorem ipsum</h4><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but alsthe leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but alsthe leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p><h4>Lorem ipsum</h4><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but alsthe leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but alsthe leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p><h4>Lorem ipsum</h4><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but alsthe leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but alsthe leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but alsthe leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>`,
  },
  {
    title: "Privacy Policy",
    description: `
       <h2 style="text-align:center;"><strong>Privacy Policy</strong></h2><p>&nbsp;</p><p>This Privacy Policy is effective as of 03.03,2023. This is our official Privacy Policy which forms part of your legal agreement with us. Please read our Privacy Policy carefully to be sure you understand how we collect and use information and under what circumstances we share information.</p><p>By accessing the services provided by the site service sparepartwale.com (“Website”), You agree to the collection and use of your data by the site/service sparepartwale.com in the manner provided in this Privacy Policy. This Policy does not apply to the procedures and practices followed by entities that are not managed, owned, or controlled by the Company and the site/service sparepartwale.com or to the people that are not engaged, employed, or managed by the Company and the site/service sparepartwale.com. Our objective is to make you:</p><ul><li>Feel comfortable using our websites;</li><li>Feel secure in submitting your information to us;</li><li>What Information do we collect About You?</li><li>We collect information from you when you sign up on the Website. When registering on the Website, you may be asked to enter your personal information (like your name, gender, age, language preferences, location of residence, mobile number, etc.).</li><li>We will automatically receive and collect certain anonymous information in standard usage logs through our Web server, including computer-identification information obtained from "cookies," sent to your browser from:</li><li>Web server cookie stored on your hard drive;</li><li>An IP address, assigned to the computer which you use;</li><li>The domain server through which you access our service;</li><li>The type of computer you're using.</li></ul><h2><strong>We may also collect information from the links you click on our platform and the number of times you access the page.</strong></h2><ol><li>If you purchase a product or service from us, we request certain personally identifiable information from you on our order form. You must provide contact information (such as name, email, and shipping address) and financial information (such as credit card number, expiration date, CVV verification, Name on card, billing address, etc.). We use this information for billing purposes and to process your orders. If we have trouble processing an order, we will use this information to contact you.</li><li>We will collect personally identifiable information about you only as part of a voluntary registration process, online survey, contest, or any combination thereof.</li><li>Our advertisers may collect anonymous traffic information from their own assigned cookies to your browser.</li><li>The Site contains links to other websites. We are not responsible for the privacy practices of such websites which we do not own, manage or control.</li><li>We make chat rooms, forums, instant messenger and message boards, and other services available to you. Please understand that any information that is disclosed in these areas becomes public information. We have no control over its use, and you should exercise caution when disclosing your personal information to anyone.</li><li>If you use a bulletin board or chat room on this site, you should be aware that any personally identifiable information you submit there can be read, collected, or used by other users of these forums, and could be used to send you unsolicited messages. We are not responsible for the personally identifiable information you choose to submit in these forums.</li></ol><p>We are the sole owners of the information collected by us at several different points on our website. Please note that the above-listed information collected by us may be stored in our database for future reference.</p><h2><strong>How do We Use this Information?</strong></h2><p>We use your email address to send you:</p><ul><li>Password reminder and registration confirmation;</li><li>Special offers;</li><li>Newsletters;</li><li>Changes in the service's policy or terms of use;</li><li>Event-based communications such as order information, renewal notices, invites, reminders, etc.</li></ul><p><strong>Note: We send users newsletters and updates upon registration. We send newsletters and/or promotional emails on behalf of our alliance partners. We use your personal information to:</strong></p><ul><li>Help us provide personalized features;</li><li>Tailor our website to your interest;</li><li>To get in touch with you in the case of password retrieval and policy changes;</li><li>To provide the services requested by you;</li><li>To preserve social history as governed by existing law or policy</li></ul><p><strong>We use contact information internally to:</strong></p><ul><li>Direct our efforts for product improvement;</li><li>Contact you as a survey respondent;</li><li>Notify you if you win any contest; and send you promotional materials from our contest sponsors or advertisers.</li></ul><p><strong>Generally, we use anonymous traffic information to:</strong></p><ul><li>Remind us of who you are in order to deliver to you a better and more personalized service from both an advertising and an editorial perspective;</li><li>Recognise your access privileges to our websites;</li><li>Help diagnose problems with our server;</li><li>Administer our websites;</li><li>Track your session so that we can understand better how people use our website.</li></ul><p><strong>Usage Disclosure</strong></p><ul><li>We will not use your financial information for any purpose other than to complete a transaction with you.</li><li>We do not share or rent your personal information with third parties except our agents and alliance partners.</li></ul><h2><strong>FDMSS</strong></h2><ol><li>We use the services of our enabling partners such as outside shipping companies, resellers, and business associates to fulfill orders, and credit card processing companies to process the payment for goods and services ordered from the website sparepartwale.com. These entities do not retain, store, share, or use personally identifiable information for any other purposes.</li><li>All credit/debit card details and personally identifiable information will NOT be stored, sold, shared, rented, or leased to any third parties.</li><li>The Website Policies and Terms &amp; Conditions may be changed or updated occasionally to meet the requirements and standards. Therefore, the Customers are encouraged to frequently visit these sections to be updated about the changes on the website. Modifications will be effective on the day they are posted.</li><li>Some of the advertisements you see on the Site are selected and delivered by third parties, such as ad networks, advertising agencies, advertisers, and audience segment providers. These third parties may collect information about you and your online activities, either on the Site or on other websites, through cookies, web beacons, and other technologies to understand your interests and deliver to your advertisements that are tailored to your interests. Please remember that we do not have access to, or control over, the information these third parties may collect. The information practices of these third parties are not covered by this privacy policy.</li></ol><h2><strong>Alliance Partners</strong></h2><p>We will share your information with our Alliance Partners who work with us or on our behalf to help provide you with the services. An alliance partner is a company or an individual who owns and manages (wholly or part of) online goods/services on their websites powered by sparepartwale.com. We will share email addresses with Agents and Alliance Partners. The Agents and Alliance Partners use the email address to confirm the deliveries, send notices, and offer services related to the goods/ service. We do not rent, sell or share your personal information and we will not disclose any of your personally identifiable information to third parties unless:</p><p>We use your email address to send you:</p><ul><li>To provide products or services you've requested;</li><li>To help investigate, prevent or take action regarding unlawful and illegal activities, suspected fraud, potential threat to the safety or security of any person, violations of sparepartwale.com terms of use or to defend against legal claims; special circumstances such as compliance with subpoenas, court orders, requests/order from legal authorities or law enforcement agencies requiring such disclosure.</li><li>We reserve the right to disclose your personally identifiable information and email address as required by law and when we believe that disclosure is necessary to protect our rights and/or comply with a judicial proceeding, court order, or legal process served on our Web site. We share your information with advertisers on an aggregate basis only. The security of your personal information and email address is important to us. When you enter sensitive information (such as credit card number and/or social security number) on our registration or order forms, we encrypt that information using secure socket layer technology (SSL). To learn more about SSL, go here.</li><li>We follow generally accepted industry standards to protect the personal information and email address submitted to us, both during transmission and once we receive it. No method of transmission over the Internet, or method of electronic storage, is 100% secure, however. Therefore, while we strive to use commercially acceptable means to protect your personal information and email address, we cannot guarantee its absolute security.</li></ul><p>If you have any questions about security on our website, you can send an email.</p><h2><strong>What Choices are Available for the Collection and Usage of Your Information?</strong></h2><ul><li>Supplying personally identifiable information is entirely voluntary. You are not required to register with us in order to use our website. However, we offer some services only to visitors who do register.</li><li>You may change your interests at any time and may opt in or opt-out of any marketing/promotional/newsletters mailings. sparepartwale.com reserves the right to send you certain service-related communication, considered to be a part of your sparepartwale.com account without offering you the facility to opt-out. You may update your information and change your account settings at any time.</li><li>If you no longer wish to receive our newsletter and promotional communications, you may opt out of receiving them by following the instructions included in each newsletter or communication or by emailing us.</li><li>We provide you with the opportunity to 'opt out' of having your email address used for certain purposes when we ask for this information. For example, if you purchase a product/service but do not wish to receive any additional marketing material from us, you can indicate your preference, follow the instructions included in each newsletter or communication or by emailing us.</li><li>Upon request, we will remove/block your personally identifiable information from our database, thereby cancelling your registration. However, your information may remain stored in the archive on our servers even after the deletion or the termination of your account.</li><li>If your personally identifiable information or email address changes, or if you no longer desire our service, you may correct, update, or deactivate it by making the change on our member information page or by emailing our Customer Support at Feedback or by contacting our contact information listed below.</li><li>If we plan to use your personally identifiable information for any commercial purposes, we will notify you at the time we collect that information and allow you to opt out of having your information used for those purposes.</li><li>You can accept or decline the cookies. All sites that are customizable require that you accept cookies. You also must accept cookies to register as someone for access to some of our services. For information on how to set your browser to alert you to cookies, or to reject cookies, go to Cookies Central.</li></ul><h2><strong>How do We Keep your Information Secure?</strong></h2><ol><li>The company has implemented reasonable physical, technical, and administrative measures to safeguard the information we collect in connection with the services. However, please note that although we take reasonable steps to protect your information, no website, Internet transmission, computer system or wireless connection is completely secure.</li><li>As you may appreciate, the Internet is a public network and we cannot guarantee that communications between you and Company or others to, though, or from the Website, will be free from unauthorized access or interference by third parties. By using the Website, you are agreeing to assume this risk and any and all responsibility and liability that may arise. We have put in place reasonable procedures to help safeguard information.</li></ol><h2><strong>Consent, Amendments, and Governing Law</strong></h2><p>By using this Website, you consent to the terms of this Privacy Policy and to our use and management of Personal Information. Should a change be incorporated in this Privacy Policy, we will make all reasonable efforts to inform you of the same. Your visit and any dispute over privacy are subject to this Privacy Policy. The said Policy shall be governed by and construed in accordance with the laws of the Republic of India. Further, it is irrevocably and unconditionally agreed that the courts of GUJARAT, India shall have exclusive jurisdiction to entertain any proceedings in relation to any disputes arising out of the same.</p>`,
  },
  {
    title: "Return Policy",
    description: `<h2 style="text-align:center;"><strong>Return, Cancellation and Refund Policy</strong></h2><h4>How is Lorem Ipsum?</h4><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.</p><h4>Lorem ipsum</h4><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but alsthe leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p><h4>Lorem ipsum</h4><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but alsthe leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but alsthe leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p><h4>Lorem ipsum</h4><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but alsthe leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but alsthe leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p><h4>Lorem ipsum</h4><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but alsthe leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but alsthe leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but alsthe leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>`,
  },
  {
    title: "Seller Terms of use",
    description: `<h2 style="text-align: center">
    <strong>Seller's Terms of Service</strong>
  </h2>
  <p>&nbsp;</p>
  <p>
  These Seller terms and conditions (the
  <strong>“Seller Terms and Conditions”</strong> ) shall be applicable
  specifically to Sellers (<i>defined hereunder</i> ) in addition to the<i
    >“General Terms of Use”</i
  >available at
  <a href="https://sparepartwale.com/seller-terms-of-use/"
    >https://sparepartwale.com/seller-terms-of-use/</a
  >. These Seller Terms and Conditions describe the terms on which a Seller can
  avail the Seller Services (<i>defined hereunder</i> ) through the Platform.
</p>
<p>
  In the event of any conflict or inconsistency between the General Terms of Use
  and these Seller Terms and Conditions, then the provisions of these Seller
  Terms and Conditions shall prevail, to the extent of such conflict or
  inconsistency.
</p>
<p>
  <strong
    >PLEASE READ THESE SELLER TERMS AND CONDITIONS CAREFULLY BEFORE REGISTERING
    AS A SELLER ON THE PLATFORM. THE SELLER'S REGISTRATION ON THE PLATFORM SHALL
    SIGNIFY THE SELLER'S UNCONDITIONAL ACCEPTANCE OF THE SELLER TERMS AND
    CONDITIONS AND THE SELLER'S AGREEMENT TO BE LEGALLY BOUND BY THE
    SAME.</strong
  >
</p>
<ol>
  <li>
    <strong>Defined terms</strong>
    <ol>
      <li>
        All defined terms used in these Seller Terms and Conditions shall have
        the same meaning as assigned to them under the General Terms of Use,
        unless otherwise specifically defined herein. The Seller Terms and
        Conditions, together with the General Terms of Use and Spare part wale
        Refund Policies, shall be referred to as the 'Terms of Use' of the
        Platform in relation to the Seller.
      </li>
      <li>
        The following defined terms shall apply in these Seller Terms and
        Conditions:
        <ol>
          <li>
            <strong>“Buyer”</strong> shall mean a buyer of the Products listed
            on the Platform.
          </li>
          <li>
            <strong>“Estimated Shipping Date”</strong> shall mean, with respect
            to any of the Seller’s Products, either: (i) the shipping
            availability date specified by the Seller in the relevant
            inventory/Product data feed for the Seller’s Product on the
            Platform;
          </li>
          <li>
            <strong>“Logistics Partner”</strong> shall mean a logistics service
            provider approved by Spare part wale and communicated from time to
            time.
          </li>
          <li>
            <strong>“Required Product Information”</strong> shall mean, with
            respect to each of the Seller’s Products listed on the Platform, the
            following: (i) description of the Product; (ii) other identifying
            information as Spare part wale may reasonably request; (iii)
            information regarding in-stock status and availability, shipping
            limitations or requirements, and Shipment Information (in each case,
            in accordance with any categorizations prescribed by Spare part wale
            from time to time); (iv) categorization within each Spare part wale
            Product category and browse structure as prescribed by Spare part
            wale from time to time; (v) digitized image that accurately depicts
            only the Seller’s Product and does not include any additional logos,
            text or other markings (vi) sales price; (vii) shipping and handling
            charges; (viii) any text, disclaimers, warnings, notices, labels or
            other content required by applicable law or otherwise to be
            displayed in connection with the offer, merchandising, advertising
            or sale of the Product; (ix) brand details; (x) model
            specifications; and (xi) any other information reasonably requested
            by Spare part wale (e.g., the condition of used or refurbished
            Products).
          </li>
          <li>
            <strong>“Seller”</strong> shall mean any person registered on the
            Platform as a seller of the Products listed on the Platform.
          </li>
          <li>
            <strong>“Seller Services”</strong> shall mean the services described
            in Clause 3 of these Seller Terms and Conditions.
          </li>
          <li>
            <strong>“Shipment”</strong> shall mean any Product, which will be
            transported by the Logistics Partner under a single Waybill (defined
            hereunder).
          </li>
          <li>
            <strong>“Shipment Information”</strong> shall mean, with respect to
            any of the Seller’s Products, the estimated or promised shipment
            and/or delivery date, with other delivery details, if any.
          </li>
          <li>
            <strong>“Spare part wale Refund Policies”</strong>shall mean the
            return and refund policies applicable to the Products, as published
            on the Platform.
          </li>
          <li>
            <strong>“Waybill”</strong> shall mean any label, including
            consignment notes that is produced by the Logistics Partner using
            automated systems for its internal record and control, and that
            contains details of the Shipment, including name of the consignor
            and consignee, origin and destination, and description and weight of
            the Shipment.
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li>
    <strong>Registration</strong>
    <ol>
      <li>
        The Seller shall be permitted to access the Platform and use the Seller
        Services, only upon creating an Account by registering on the Platform.
      </li>
      <li>
        The Seller’s ability to continue using the Platform to avail the Seller
        Services is subject to continued registration on the Platform.
      </li>
      <li>
        In order to register as a Seller on the Platform, the Seller will be
        required to create a username and password, and provide such details as
        indicated as necessary, including but not limited to the Seller’s name
        (or name of company/ other entity, as the case may be), address, phone
        number and email address.
      </li>
    </ol>
  </li>
  <li>
    <strong>Seller Services</strong>
    <ol>
      <li>
        The Platform provides the following services for Sellers (collectively,
        <strong>“Seller Services ”</strong>):
        <ol>
          <li>
            It provides an online marketplace wherein Sellers can list their
            Products at any point of time for sale on the Platform, along with
            the Required Product Information for each Product provided by the
            Sellers to Spare part wale. Sellers shall provide the Required
            Product Information in the format and manner as specified by Spare
            part wale. The Seller shall promptly update the Required Product
            Information as and when required and ensure that it shall, at all
            times, remain accurate and complete;
          </li>
          <li>
            It facilitates the sale of Products, making payments for such
            Products, and any other communications between Buyers and Sellers as
            per the terms hereof, including facilitating the shipment, return or
            exchange of Products, where applicable, or cancellation of
            orders/Products;
          </li>
          <li>
            It provides for various Product categories on the Platform, under
            which the Seller may list his/its Products for sale. Spare part wale
            reserves a right to modify such listing of the Product by the
            Seller, at any time and in the sole discretion of Spare part wale;
          </li>
          <li>
            It enables Spare part wale to share details of the order placed by a
            Buyer on the Platform, listing out the specifics of the Product to
            be sold by the Seller;
          </li>
          <li>
            It also facilitates delivery of Products to the Buyers, through
            Logistics Partners engaged by Spare part wale; and
          </li>
          <li>
            Any other services as may be provided or offered by Spare part wale
            to the Sellers from time to time.
          </li>
        </ol>
      </li>
      <li>
        The Seller Services are only being provided to facilitate sale of
        Products on the Platform, and Spare part wale shall not be responsible
        for the transaction to be entered into between a Buyer and a Seller. All
        commercial and contractual terms for any sale of the Products through
        the Platform are those offered by the Seller only, and the Products
        shall be sold on such terms as agreed upon between the Seller and the
        Buyer alone. Such commercial and contractual terms include without
        limitation Product prices, terms, date, period, warranties and
        after-sales services. Spare part wale does not determine, advice, have
        any control over, or in any way involve itself in the offering or
        acceptance of such commercial and contractual terms between the Sellers
        and the Buyers
      </li>
      <li>
        Buyers may provide feedback, review, ratings and comments about the
        Seller. The Sellers agree and accept that the ratings provided on the
        Platform are on the basis of such feedback and comments of the Buyers
        only, and that Spare part wale is in no manner responsible or liable for
        the same. All views and opinions expressed on the Platform by the Buyers
        are those of the individual Buyers only, and do not in any way reflect
        the opinion of Spare part wale. Spare part wale shall not assess or rate
        any Seller on the Platform. Further, in case of any service-related
        complaints or negative feedback from a Buyer, Sellers agree to address
        or resolve the matter in a speedy and amicable manner. Spare part wale
        shall not, and is not required to, mediate or resolve any dispute or
        disagreement between any Seller and Buyer.
      </li>
      <li>
        If any Seller consistently receives negative feedback from Buyers, Spare
        part wale shall have a right to take such action as provided under
        Clause 7 below, without prior notice to the Seller.
      </li>
    </ol>
  </li>
  <li>
    <strong>Conditions of Listing</strong>
    <ol>
      <li>
        Spare part wale shall, in its sole discretion, have the right to de-list
        any or all of the Products listed on the Platform by a Seller based on
        such factors as it deems fit, including but not limited to any
        complaints received from Buyers in relation to any Product.
      </li>
      <li>
        Spare part wale does not provide any guarantee to Sellers that listing
        the Products on the Platform by the Sellers will result in leads from
        the Buyers, or in any specific volume of sales, or completion of any
        transaction of sale.
      </li>
    </ol>
  </li>
  <li>
    <strong>Representations and Warranties by Sellers</strong>
    <ol>
      <li>
        By registering on the Platform and/or listing any Products thereon, each
        Seller represents and warrants that:
        <ol>
          <li>
            the Seller is the legal owner/authorized reseller/dealer of each
            Product which the Seller lists on the Platform, and the Seller has
            all rights to list and offer for sale, the said Products on the
            Platform, and by doing so, the Seller is not violating or infringing
            upon the rights (including the intellectual property rights) of any
            other person, and any applicable laws;
          </li>
          <li>
            all the Required Product Information of the Products listed on the
            Platform, which is provided by the Seller, is current, complete and
            accurate;
          </li>
          <li>
            the Seller shall, at all times, offer the Products for sale to the
            Buyers registered on the Platform on such price, terms and
            conditions which are not less advantageous than the price, terms and
            conditions offered by the Seller to any other person;
          </li>
          <li>
            the Seller shall ensure that he/it sources and sells Products in
            accordance with the terms of the applicable order information shared
            by Spare part wale. The Seller shall be solely responsible for and
            bear all risk in relation to such procurement and sale activities;
          </li>
          <li>
            the Seller : (i) shall package each of the Products sold by the
            Seller in a proper manner, as per industry standards, to ensure that
            no damage is caused to the Product during delivery; (ii) shall
            regularly retrieve order information by checking the Seller’s
            Account on the Platform at least once each business day; (iii) shall
            not cancel any of the sale transactions except as may be permitted
            in accordance with the cancellation policy; (iv) shall identify
            itself/himself as the seller of the Product on all packing slips and
            other documents/information; and (v) shall not send Buyers any
            emails confirming orders. For all the Products listed on the
            Platform, the Seller shall accept, and process returns, refunds and
            adjustments in accordance with Spare part wale Refund Policies found
            at [https://sparepartwale.com/pages/static/return-policy/].
          </li>
        </ol>
      </li>
    </ol>
  </li>
  <li>
    <strong>Required Product Information</strong>
    <ol>
      <li>
        Spare part wale reserves the right to use all Required Product
        Information provided by Seller towards arranging and compiling
        catalogues of such information. Such arranged and compiled catalogues,
        including the Required Product Information and all other content
        contained therein, shall always be the property of Spare part wale, and
        no person, including Seller, shall make any claim, whether proprietary
        or otherwise, in respect of such catalogues.
      </li>
    </ol>
  </li>
  <li>
    <strong>Disclaimers</strong>
    <ol>
      <li>
        Spare part wale does not make any representations or warranties
        regarding specifics (such as quality, value, and salability) of the
        Products offered to be sold or purchased on the Platform. Spare part
        wale does not implicitly or explicitly support or endorse the sale or
        purchase of any Products on the Platform. Spare part wale accepts no
        liability for any errors, defects or omissions, and provides no
        guarantee to rectify such errors, defects or omissions, whether on
        behalf of itself or any third parties.
      </li>
      <li>
        Spare part wale shall not be responsible or liable for any
        nonperformance or breach of any contract between Sellers and Buyers.
        Spare part wale cannot, and does not, guarantee that Sellers and Buyers
        will perform the transaction(s) as concluded on the Platform. Spare part
        wale shall not, and is not required, to mediate or resolve disputes or
        disagreements between Sellers and Buyers, as Spare part wale is only a
        facilitator of the sale transaction on the Platform.
      </li>
    </ol>
  </li>
  <li>
    <strong>Payments</strong>
    <ol>
      <li>
        Spare part wale shall remit payments to the Sellers (excluding Cash on
        Delivery (COD) transactions) through a nodal account (hereinafter
        referred to as the “Nodal Account”) in accordance with the directions
        and notifications issued by the Reserve Bank of India for the opening
        and operation of accounts and settlement of payments, and for electronic
        payment transactions involving intermediaries. The remittances for COD
        transactions shall be made through the online bank. The Seller hereby
        agrees and authorizes Spare part wale to collect payments on the
        Seller’s behalf from Buyers for any sales made through the COD
        mechanism, whether directly or through the Logistics Partner. Further,
        the Seller authorizes and permits Spare part wale to collect and
        disclose any information (which may include personal or sensitive
        information) made available to Spare part wale in connection with these
        Seller Terms and Conditions to a bank, auditor, processing agency, or
        any person contracted by Spare part wale.
      </li>
      <li>
        The Seller authorizes Spare part wale, and Spare part wale will remit
        the settlement amount to the Nodal Account within a period of 3 (three)
        days of receipt of confirmation from the Buyer of the completion of the
        Product sale transaction.
      </li>
      <li>
        In the event that that any amounts are due and payable by the Seller to
        Spare part wale, Spare part wale shall have a right to retain such
        outstanding amounts due from the Seller, from the settlement amounts
        payable to the Seller for any completed transaction, at any point of
        time, without prior notice to the Seller; and the Seller confirms and
        authorizes Spare part wale to undertake the same.
      </li>
    </ol>
  </li>
  <li>
    <strong>Remedies</strong>
    <ol>
      <li>
        Spare part wale reserves the right, at any time to remove one or more of
        the listings(s) of the Seller on the Platform; and/or (ii) limit or
        remove access of the Seller to the Platform/Seller Services or any part
        thereof; and/or (iii) delete the Account of the Seller.
      </li>
    </ol>
  </li>
  <li>
    <strong>Seller’s Obligations</strong>
    <ol>
      <li>
        Sellers are responsible for any non-delivery, wrongful delivery, theft
        or other mistake or act in connection with the fulfilment and delivery
        of the Products ordered, except to the extent caused by Spare Part
        Wale’s failure to provide the order information to the Seller as it was
        received by Spare part wale. Further, the Sellers are also responsible
        for any nonconformity or defect in, or any public or private recall of,
        any Products, which shall be solely at the Seller’s cost and expenses.
        Sellers will promptly notify Spare Part Wale on receiving the knowledge
        of any public or private recalls of Products.
      </li>
      <li>
        The Seller shall initiate the delivery process on every product order
        information received by it/him promptly, not later than announced in
        offer term of dispatch (Dispatched in X Days) from the date of receipt
        of such order information.
      </li>
      <li>
        If Spare part wale informs any Seller that Spare part wale has received
        a claim from any Buyer on the Platform, or any request for chargeback or
        other dispute, concerning a sale transaction, the Seller must deliver to
        Spare part wale: (a) sufficient proof of delivery of the Product(s); (b)
        the applicable Spare part wale order identification number; and (c) a
        description of the Product(s). If a Seller fails to comply with the
        foregoing, or if the claim, chargeback, or dispute is not caused by
        Spare Part Wale’s failure to make the order information received by it,
        available to the Seller, then the Seller will promptly reimburse Spare
        part wale for such amount as notified by Spare part wale in relation to
        such Product purchase (including the purchase price, all associated
        shipping and handling charges and all taxes, all associated credit card
        association,bank or other payment processing, re-presentment and/or
        penalty and fees).
      </li>
      <li>
        The Seller will not, and will cause Seller’s affiliates not to, directly
        or indirectly: (i) disclose or convey any transaction information
        carried on the Platform (except as necessary for the Seller to perform
        the Seller’s obligations under the General Terms of Use and these Seller
        Terms and Conditions, and provided that the Seller ensures that every
        recipient uses the information only for that purpose and complies with
        the restrictions applicable to Seller related to that information); (ii)
        use any transaction information carried on the Platform for any
        marketing or promotional purposes whatsoever (except as permitted
        below), or otherwise in any way inconsistent with Spare Part Wale's
        privacy policies or applicable laws; (iii) contact a Buyer that has
        ordered a Product that has not yet been delivered, with the intent of
        collecting any amounts in connection therewith, to influence such Buyer
        to make an alternative purchase, or to harass such Buyer; (iv) disparage
        Spare part wale, its’ affiliates, and/or any of their other products or
        services; or any Buyer; or (v) target communications of any kind on the
        basis of the intended recipient being a User. The terms of this Clause
        do not prevent Sellers from using other information that Sellers acquire
        without reference to the transaction information carried on the Platform
        for any purpose, provided that the Sellers do not target communications
        on the basis of the intended recipient being a User, and provided the
        same is in compliance with these Terms of Use.
      </li>
    </ol>
  </li>
  <li>
    <strong>Logistics Services</strong>
    <ol>
      <li>
        The following conditions shall be applicable to all Product deliveries
        made in relation to sale transactions concluded through the Platform, by
        using a Logistics Partner:
        <ol>
          <li>
            The Seller shall ensure that all Shipments, and their contents, are
            following all applicable laws, including the laws of India as well
            as any international conventions applicable to the transportation
            and delivery of goods. Specifically, no Shipment shall contain any
            currency notes, hazardous chemicals, highly inflammable substances,
            biomedical waste, nuclear substances or waste, or any other
            substance or item, the transportation of which is prohibited by
            shipping, railway or airline companies or departments and other
            government and statutory authorities
          </li>
          <li>
            Logistics Partners shall accept Shipments in good faith, relying
            upon the description of the Products provided by the Seller, and
            Spare part wale and the Logistics Partner disclaim all liability in
            the event of any Shipment, or the contents therein, failing to
            comply with all applicable laws or these Terms of Use, and the
            Seller shall indemnify and hold Spare part wale, the Logistics
            Partner and their respective employees, officers and agents harmless
            against any claims, losses, expenses, penalties, fines, damages and
            judgements arising out of or in connection with the Seller’s failure
            to comply with applicable laws and these Terms of Use. The Logistics
            Partner may, at its sole discretion and without assigning any
            reason, inspect the contents of any Shipment. The Logistics Partner
            may, at its sole discretion, refuse to accept any Shipment if it
            believes or suspects that such Shipment or contents therein are
            contrary to applicable laws.
          </li>
          <li>
            The liability of Spare part wale and the Logistics Partner
            individually shall, under all circumstances without exception, be
            limited to the higher of: (i) [●] or (ii) the maximum standard
            liability of common carriers prescribed under the applicable law. It
            is advisable for the Seller to procure adequate insurance for all
            the Products offered for sale by the Seller. The Seller must use
            suitable packing materials for all Shipments, such that the contents
            are adequately protected. Spare part wale and the Logistics Partner
            shall not be liable in any manner for any damage caused to any
            Shipment owing to inadequate or improper packing of the Products.
            All Shipments will be delivered only to the consignee at the address
            specified on the Waybill. It shall be the Seller’s sole
            responsibility and liability to ensure that the name and address of
            the consignee are properly communicated to the Logistics Partner. If
            the Seller is required to dispatch several Shipments to the same
            consignee, it shall be the Seller’s responsibility to ensure that
            the correct consignee's name and address is captured on all such
            Shipments.
          </li>
          <li>
            It shall be the responsibility of the Seller to ensure that
            Shipments are handed over to the Logistics Partner at or before the
            cut-off time prescribed by the Logistics Partner, in order to ensure
            that such Shipments are dispatched on the same day. The transit
            times prescribed by Logistics Partners include only business days,
            and any non-business days or holidays will form part of the
            calculations to determine the transit time and/or Estimated Shipping
            Date. The Seller shall ensure that all Shipments are accompanied by
            requisite declarations and forms, as prescribed under applicable
            laws, in order to facilitate faster clearances by government or
            regulatory authorities, as applicable.
          </li>
          <li>
            If any Shipment is “returned to origin” for any reason whatsoever,
            the Seller shall make payment of freight charges to the Logistics
            Partner.
          </li>
          <li>
            Spare part wale and the Logistics Partner will not be responsible or
            liable in any manner for any damage to Shipments in the event of any
            “reverse pickup” from the consignee, or if the Buyer/consignee
            rejects the Shipment at the time of delivery, unless the same is on
            account of damage to the Shipment caused directly by the Logistics
            Partner. The Logistics Partner reserves the right to cancel any
            “reverse pickup” request without prior notice and without assigning
            any reason thereto.
          </li>
          <li>
            . Neither Spare part wale nor the Logistics Partner shall be liable
            in any manner for any delay or failure of delivery of any Shipment
            for reasons beyond the reasonable control of Spare part wale or the
            Logistics Partner, including without limitation on account of
            natural disasters, accidents, fire, labor issues, theft, war, etc.
          </li>
          <li>
            The Seller agrees to indemnify and hold Spare part wale, the
            Logistics Partner and their respective employees, officers and
            agents, harmless from and against any claim, loss, damage, expense,
            penalty or fine arising out of: (a) the Seller’s failure to comply
            with any applicable law and the Terms of Use, and (b) the Seller’s
            breach of any of the following representations and warranties made
            by Seller that:
            <ol>
              <li>
                all information provided by the Seller or the Seller’s
                representatives is up-to-date, complete and accurate;
              </li>
              <li>
                the Shipment was prepared and packaged in secure premises by the
                Seller or the Seller’s representatives;
              </li>
              <li>
                the Seller employed reliable and qualified staff to prepare and
                package the Shipment;
              </li>
              <li>
                the Seller protected the Shipment against unauthorized
                interference during preparation, storage and transportation to
                the Logistics Partner; and
              </li>
              <li>
                the Shipment is properly marked and addressed and packed to
                ensure safe transportation with ordinary care in handling to the
                appropriate consignee
              </li>
              <li>
                All disputes relating to the transportation, shipping and
                delivery of any Shipment shall be subject to the jurisdiction of
                the courts located in the city where such Shipment was booked
                and handed over to the Logistics Partner.
              </li>
            </ol>
          </li></ol></li></ol></li></ol>`,
  },
  {
    title: "Anti-Corruption Policy",
    description: `<h2 style="text-align:center;"><strong>Anti Corruption Policy</strong></h2><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p><p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.</p><h4>Lorem ipsum</h4><ul><li>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</li><li>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</li><li>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</li></ul><h4>Lorem ipsum</h4><ul><li>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</li><li>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</li><li>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</li></ul><h4>Lorem ipsum</h4><ul><li>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</li><li>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</li><li>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</li><li>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</li><li>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</li><li>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</li></ul><h4>Lorem ipsum</h4><ul><li>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</li><li>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</li><li>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</li><li>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</li><li>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</li><li>The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</li></ul>`,
  },
];

const customPages = async () => {
  for (let i = 0; i < pages.length; i++) {
    CMS.findOneAndUpdate(
      { slug: await createSlug(pages[i].title) },
      {
        title: pages[i].title,
        slug: await createSlug(pages[i].title),
        description: pages[i].description,
      },
      { upsert: true }
    )
      .then((data) => {})
      .catch((err: any) => {
        console.log(err);
      });
  }
};

customPages();

export default CMS;
