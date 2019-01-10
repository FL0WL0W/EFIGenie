
#if !defined(ISHIFTSERVICE_H)
#define ISHIFTSERVICE_H
namespace TransmissionControlServices
{
	class IShiftService
	{
	public:
		virtual void SetGear(unsigned char gear) = 0;
	};
}
#endif