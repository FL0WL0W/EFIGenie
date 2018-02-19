namespace EngineManagement
{
	class MockFuelTrimService : public IFuelTrimService
	{
	public:
		MOCK_METHOD1(GetFuelTrim, short(unsigned char));
	};
}