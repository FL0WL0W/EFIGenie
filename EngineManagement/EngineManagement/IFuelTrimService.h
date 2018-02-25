#define IFuelTrimServiceExists
namespace EngineManagement
{
	class IFuelTrimService
	{
	public:
		virtual short GetFuelTrim(unsigned char cylinder) = 0;
	};

	extern IFuelTrimService *CurrentFuelTrimService;

	IFuelTrimService *CreateFuelTrimService(void *config);
}