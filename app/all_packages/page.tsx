import PackHeader from './pack_header';
import Allpacks from './allpacks';
import BookingComponent from './filters';
import Footer from '@/components/footer';



export default function AllPackagesPage() {
  return (
    <>
      
      <PackHeader />
        <Allpacks />
        <BookingComponent />
        <Footer />
    
      
    </>
  );
}